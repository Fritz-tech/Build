import { notFound } from "next/navigation";
import { db } from "@/db";
import { project, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { WorkspaceClient } from "./workspace-client";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function WorkspacePage({ params }: PageProps) {
  const { projectId } = await params;

  const rows = await db
    .select({
      project: project,
      user: { name: user.name, email: user.email, image: user.image },
    })
    .from(project)
    .innerJoin(user, eq(project.userId, user.id))
    .where(eq(project.id, projectId))
    .limit(1);

  if (!rows.length) notFound();

  const { project: proj, user: owner } = rows[0];

  return <WorkspaceClient project={proj} owner={owner} />;
}
