import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { project, session, user } from "@/db/schema";
import { uploadAsset, type UploadedAsset } from "@/lib/storage";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  // ── 1. Authenticate: look up Bearer token directly in the shared Postgres DB
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [row] = await db
    .select({ session: session, user: user })
    .from(session)
    .innerJoin(user, eq(session.userId, user.id))
    .where(eq(session.token, token))
    .limit(1);

  if (!row || new Date(row.session.expiresAt) < new Date()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = row.user.id;

  // ── 2. Parse multipart form data ─────────────────────────────────────
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const prompt = (formData.get("prompt") as string | null)?.trim();
  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const rawFiles = formData.getAll("assets") as File[];

  // ── 3. Create project record (get the ID for the S3 path) ─────────────
  const [newProject] = await db
    .insert(project)
    .values({
      userId,
      prompt,
      status: "queued",
      assets: "[]",
    })
    .returning();

  // ── 4. Upload assets to CloudHike S3 storage ─────────────────────────
  const uploadedAssets: UploadedAsset[] = [];
  for (const file of rawFiles) {
    if (file.size === 0) continue;
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const asset = await uploadAsset(
        buffer,
        file.name,
        file.type || "application/octet-stream",
        newProject.id
      );
      uploadedAssets.push(asset);
    } catch (err) {
      console.error("Failed to upload asset:", file.name, err);
      // Non-fatal — continue with remaining files
    }
  }

  // ── 5. Update project record with asset metadata ───────────────────────
  if (uploadedAssets.length > 0) {
    await db
      .update(project)
      .set({ assets: JSON.stringify(uploadedAssets) })
      .where(eq(project.id, newProject.id));
    newProject.assets = JSON.stringify(uploadedAssets);
  }

  return NextResponse.json({ project: newProject }, { status: 201 });
}
