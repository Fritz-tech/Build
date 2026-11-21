import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { project } from "@/db/schema";
import { uploadAsset, type UploadedAsset } from "@/lib/storage";
import { and, desc, eq } from "drizzle-orm";
import { getOrCreateAppUser, verifyCloudHikeToken } from "@/lib/cloudhike-auth";

async function authenticate(req: NextRequest) {
  const header = req.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;
  const authUser = await verifyCloudHikeToken(token);
  return authUser ? getOrCreateAppUser(authUser) : null;
}

export async function GET(req: NextRequest) {
  try {
    const appUser = await authenticate(req);
    if (!appUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const projects = await db.select().from(project).where(eq(project.userId, appUser.id)).orderBy(desc(project.createdAt));
    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Project list failed:", error);
    return NextResponse.json({ error: "Unable to load projects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const appUser = await authenticate(req);
    if (!appUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    let formData: FormData;
    try { formData = await req.formData(); } catch { return NextResponse.json({ error: "Invalid form data" }, { status: 400 }); }
    const prompt = (formData.get("prompt") as string | null)?.trim();
    if (!prompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    const files = formData.getAll("assets").filter((entry): entry is File => entry instanceof File);
    const [newProject] = await db.insert(project).values({
      userId: appUser.id, prompt, status: "queued", assets: "[]",
    }).returning();
    const uploaded: UploadedAsset[] = [];
    for (const file of files) {
      if (!file.size) continue;
      try {
        uploaded.push(await uploadAsset(Buffer.from(await file.arrayBuffer()), file.name, file.type || "application/octet-stream", newProject.id));
      } catch (error) {
        console.error("Failed to upload project asset:", file.name, error);
        return NextResponse.json({ error: `Project was created, but uploading "${file.name}" failed. Check storage configuration.`, projectId: newProject.id }, { status: 502 });
      }
    }
    if (uploaded.length) {
      await db.update(project).set({ assets: JSON.stringify(uploaded) })
        .where(and(eq(project.id, newProject.id), eq(project.userId, appUser.id)));
      newProject.assets = JSON.stringify(uploaded);
    }
    return NextResponse.json({ project: newProject }, { status: 201 });
  } catch (error) {
    console.error("Project creation failed:", error);
    return NextResponse.json({ error: "Unable to create project" }, { status: 500 });
  }
}
