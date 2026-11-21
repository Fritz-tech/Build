import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { project } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getOrCreateAppUser, verifyCloudHikeToken } from "@/lib/cloudhike-auth";

interface Context { params: Promise<{ projectId: string }> }

export async function GET(req: NextRequest, { params }: Context) {
  try {
    const header = req.headers.get("authorization");
    const token = header?.startsWith("Bearer ") ? header.slice(7).trim() : "";
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const authUser = await verifyCloudHikeToken(token);
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const appUser = await getOrCreateAppUser(authUser);
    const { projectId } = await params;
    const [ownedProject] = await db.select().from(project)
      .where(and(eq(project.id, projectId), eq(project.userId, appUser.id))).limit(1);
    if (!ownedProject) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    return NextResponse.json({ project: ownedProject, owner: { name: appUser.name, email: appUser.email, image: appUser.image } });
  } catch (error) {
    console.error("Workspace lookup failed:", error);
    return NextResponse.json({ error: "Unable to load project" }, { status: 500 });
  }
}
