import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { project } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

interface Context { params: Promise<{ projectId: string }> }

export async function GET(req: NextRequest, { params }: Context) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { projectId } = await params;
    const [ownedProject] = await db.select().from(project)
      .where(and(eq(project.id, projectId), eq(project.userId, session.user.id))).limit(1);
    if (!ownedProject) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    return NextResponse.json({
      project: ownedProject,
      owner: { name: session.user.name, email: session.user.email, image: session.user.image },
    });
  } catch (error) {
    console.error("Workspace lookup failed:", error);
    return NextResponse.json({ error: "Unable to load project" }, { status: 500 });
  }
}
