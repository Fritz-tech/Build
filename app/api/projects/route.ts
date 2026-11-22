import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { project } from "@/db/schema";
import { uploadAsset, type UploadedAsset } from "@/lib/storage";
import { and, desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

async function authenticate(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user ?? null;
}

export async function GET(req: NextRequest) {
  try {
    const authUser = await authenticate(req);
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const projects = await db.select().from(project).where(eq(project.userId, authUser.id)).orderBy(desc(project.createdAt));
    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Project list failed:", error);
    return NextResponse.json({ error: "Unable to load projects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await authenticate(req);
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    let formData: FormData;
    try { formData = await req.formData(); } catch { return NextResponse.json({ error: "Invalid form data" }, { status: 400 }); }
    const prompt = (formData.get("prompt") as string | null)?.trim();
    if (!prompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    const files = formData.getAll("assets").filter((entry): entry is File => entry instanceof File);
    const [newProject] = await db.insert(project).values({
      userId: authUser.id, prompt, status: "queued", assets: "[]",
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
        .where(and(eq(project.id, newProject.id), eq(project.userId, authUser.id)));
      newProject.assets = JSON.stringify(uploaded);
    }
    return NextResponse.json({ project: newProject }, { status: 201 });
  } catch (error) {
    console.error("Project creation failed:", error);
    return NextResponse.json({ error: "Unable to create project" }, { status: 500 });
  }
}
