import { Router } from "express";
import { db } from "@workspace/db";
import { pullRequestsTable, projectsTable, auditEntriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function serialize(pr: typeof pullRequestsTable.$inferSelect, projectName?: string) {
  return {
    ...pr,
    projectName: projectName ?? "",
    description: pr.description ?? null,
    url: pr.url ?? null,
    taskId: pr.taskId ?? null,
    createdAt: pr.createdAt.toISOString(),
    mergedAt: pr.mergedAt?.toISOString() ?? null,
  };
}

router.get("/", async (req, res) => {
  const { status } = req.query;
  let prs = await db.select().from(pullRequestsTable).orderBy(pullRequestsTable.createdAt);
  if (status) prs = prs.filter(p => p.status === String(status));
  const projects = await db.select().from(projectsTable);
  const projectMap = Object.fromEntries(projects.map(p => [p.id, p.name]));
  res.json(prs.map(p => serialize(p, projectMap[p.projectId])));
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [pr] = await db.select().from(pullRequestsTable).where(eq(pullRequestsTable.id, id));
  if (!pr) return res.status(404).json({ error: "Not found" });
  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, pr.projectId));
  res.json(serialize(pr, project?.name));
});

router.patch("/:id/merge", async (req, res) => {
  const id = Number(req.params.id);
  const [pr] = await db.update(pullRequestsTable)
    .set({ status: "merged", mergedAt: new Date() })
    .where(eq(pullRequestsTable.id, id))
    .returning();
  if (!pr) return res.status(404).json({ error: "Not found" });
  await db.insert(auditEntriesTable).values({
    entityType: "pull_request",
    entityId: id,
    action: "pr_merged",
    actor: "user",
    details: `PR #${id} "${pr.title}" merged`,
  });
  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, pr.projectId));
  res.json(serialize(pr, project?.name));
});

router.patch("/:id/close", async (req, res) => {
  const id = Number(req.params.id);
  const [pr] = await db.update(pullRequestsTable)
    .set({ status: "closed" })
    .where(eq(pullRequestsTable.id, id))
    .returning();
  if (!pr) return res.status(404).json({ error: "Not found" });
  await db.insert(auditEntriesTable).values({
    entityType: "pull_request",
    entityId: id,
    action: "pr_closed",
    actor: "user",
    details: `PR #${id} "${pr.title}" closed without merge`,
  });
  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, pr.projectId));
  res.json(serialize(pr, project?.name));
});

export default router;
