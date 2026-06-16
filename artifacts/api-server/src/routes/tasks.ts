import { Router } from "express";
import { db } from "@workspace/db";
import { tasksTable, projectsTable, auditEntriesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

function serializeTask(task: typeof tasksTable.$inferSelect, projectName?: string) {
  return {
    ...task,
    projectName: projectName ?? "",
    filesModified: task.filesModified as string[],
    createdAt: task.createdAt.toISOString(),
    completedAt: task.completedAt?.toISOString() ?? null,
    plan: task.plan ?? null,
    buildStatus: task.buildStatus ?? null,
    confidenceScore: task.confidenceScore ?? null,
  };
}

router.get("/", async (req, res) => {
  const { projectId, status } = req.query;
  let tasks = await db.select().from(tasksTable).orderBy(tasksTable.createdAt);

  if (projectId) tasks = tasks.filter(t => t.projectId === Number(projectId));
  if (status) tasks = tasks.filter(t => t.status === String(status));

  const projects = await db.select().from(projectsTable);
  const projectMap = Object.fromEntries(projects.map(p => [p.id, p.name]));

  res.json(tasks.map(t => serializeTask(t, projectMap[t.projectId])));
});

router.post("/", async (req, res) => {
  const { projectId, prompt, type } = req.body;
  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, Number(projectId)));
  if (!project) return res.status(404).json({ error: "Project not found" });

  const [task] = await db.insert(tasksTable).values({
    projectId: Number(projectId),
    type: type ?? "fix",
    status: "planning",
    prompt: String(prompt),
    filesModified: [],
    plan: `1. Analyse the codebase for "${prompt}"\n2. Identify affected files\n3. Generate and apply changes\n4. Validate build\n5. Create pull request`,
    confidenceScore: Math.floor(Math.random() * 20) + 75,
  }).returning();

  await db.insert(auditEntriesTable).values({
    entityType: "task",
    entityId: task.id,
    action: "task_created",
    actor: "user",
    details: `Task created: "${prompt}"`,
  });

  setTimeout(async () => {
    await db.update(tasksTable).set({ status: "awaiting_approval" }).where(eq(tasksTable.id, task.id));
  }, 2000);

  res.status(201).json(serializeTask(task, project.name));
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, id));
  if (!task) return res.status(404).json({ error: "Not found" });
  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, task.projectId));
  res.json(serializeTask(task, project?.name));
});

router.patch("/:id/approve", async (req, res) => {
  const id = Number(req.params.id);
  const [task] = await db.update(tasksTable)
    .set({ status: "running" })
    .where(eq(tasksTable.id, id))
    .returning();
  if (!task) return res.status(404).json({ error: "Not found" });

  await db.insert(auditEntriesTable).values({
    entityType: "task",
    entityId: id,
    action: "task_approved",
    actor: "user",
    details: `Task #${id} approved for execution`,
  });

  setTimeout(async () => {
    await db.update(tasksTable).set({
      status: "completed",
      completedAt: new Date(),
      buildStatus: "success",
      filesModified: ["src/components/Header.tsx", "src/lib/auth.ts"],
    }).where(eq(tasksTable.id, id));
  }, 4000);

  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, task.projectId));
  res.json(serializeTask(task, project?.name));
});

router.patch("/:id/reject", async (req, res) => {
  const id = Number(req.params.id);
  const [task] = await db.update(tasksTable)
    .set({ status: "rejected", completedAt: new Date() })
    .where(eq(tasksTable.id, id))
    .returning();
  if (!task) return res.status(404).json({ error: "Not found" });

  await db.insert(auditEntriesTable).values({
    entityType: "task",
    entityId: id,
    action: "task_rejected",
    actor: "user",
    details: `Task #${id} rejected`,
  });

  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, task.projectId));
  res.json(serializeTask(task, project?.name));
});

export default router;
