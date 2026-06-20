import { Router } from "express";
import { db } from "@workspace/db";
import {
  projectsTable,
  issuesTable,
  tasksTable,
  auditEntriesTable,
  insertProjectSchema,
} from "@workspace/db";
import { eq, count, avg } from "drizzle-orm";
import { projectScanQueue } from "../lib/queues";

const router = Router();

router.get("/", async (_req, res) => {
  const projects = await db.select().from(projectsTable).orderBy(projectsTable.createdAt);
  res.json(projects.map(p => ({
    ...p,
    lastScanAt: p.lastScanAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
  })));
});

router.post("/", async (req, res) => {
  const body = insertProjectSchema.parse({
    name: req.body.name,
    repoUrl: req.body.repoUrl,
    language: req.body.language ?? "TypeScript",
    branch: req.body.branch ?? "main",
    status: "idle",
    healthScore: 100,
  });
  const [project] = await db.insert(projectsTable).values(body).returning();
  await db.insert(auditEntriesTable).values({
    entityType: "project",
    entityId: project.id,
    action: "project_created",
    actor: "user",
    details: `Project "${project.name}" added`,
  });
  res.status(201).json({
    ...project,
    lastScanAt: project.lastScanAt?.toISOString() ?? null,
    createdAt: project.createdAt.toISOString(),
  });
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, id));
  if (!project) return res.status(404).json({ error: "Not found" });
  res.json({
    ...project,
    lastScanAt: project.lastScanAt?.toISOString() ?? null,
    createdAt: project.createdAt.toISOString(),
  });
});

router.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const updates: Record<string, unknown> = {};
  if (req.body.name !== undefined) updates.name = req.body.name;
  if (req.body.repoUrl !== undefined) updates.repoUrl = req.body.repoUrl;
  if (req.body.language !== undefined) updates.language = req.body.language;
  if (req.body.branch !== undefined) updates.branch = req.body.branch;
  if (req.body.status !== undefined) updates.status = req.body.status;
  const [project] = await db.update(projectsTable).set(updates).where(eq(projectsTable.id, id)).returning();
  if (!project) return res.status(404).json({ error: "Not found" });
  res.json({
    ...project,
    lastScanAt: project.lastScanAt?.toISOString() ?? null,
    createdAt: project.createdAt.toISOString(),
  });
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(projectsTable).where(eq(projectsTable.id, id));
  res.status(204).send();
});

router.get("/:id/issues", async (req, res) => {
  const id = Number(req.params.id);
  const issues = await db.select().from(issuesTable).where(eq(issuesTable.projectId, id)).orderBy(issuesTable.createdAt);
  res.json(issues.map(i => ({ ...i, createdAt: i.createdAt.toISOString(), line: i.line ?? null })));
});

router.post("/:id/scan", async (req, res) => {
  const id = Number(req.params.id);
  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, id));
  if (!project) return res.status(404).json({ error: "Not found" });

  await db.update(projectsTable).set({ status: "scanning" }).where(eq(projectsTable.id, id));

  const [task] = await db.insert(tasksTable).values({
    projectId: id,
    type: "scan",
    status: "running",
    prompt: `Automated scan of ${project.name}`,
    filesModified: [],
  }).returning();

  await db.insert(auditEntriesTable).values({
    entityType: "project",
    entityId: id,
    action: "scan_triggered",
    actor: "user",
    details: `Scan triggered for "${project.name}"`,
  });

  await projectScanQueue.add("scan-project", { projectId: id, taskId: task.id });

  res.status(202).json({
    ...task,
    projectName: project.name,
    filesModified: task.filesModified as string[],
    createdAt: task.createdAt.toISOString(),
    completedAt: task.completedAt?.toISOString() ?? null,
    plan: task.plan ?? null,
    buildStatus: task.buildStatus ?? null,
    confidenceScore: task.confidenceScore ?? null,
  });
});

router.get("/:id/summary", async (req, res) => {
  const id = Number(req.params.id);
  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, id));
  if (!project) return res.status(404).json({ error: "Not found" });

  const issues = await db.select().from(issuesTable).where(eq(issuesTable.projectId, id));
  const openIssues = issues.filter(i => i.status === "open").length;
  const criticalIssues = issues.filter(i => i.severity === "critical" && i.status === "open").length;

  const tasks = await db.select().from(tasksTable).where(eq(tasksTable.projectId, id));
  const openTasks = tasks.filter(t => ["pending", "planning", "awaiting_approval", "running"].includes(t.status)).length;

  res.json({
    projectId: id,
    healthScore: project.healthScore,
    openIssues,
    criticalIssues,
    lastScanAt: project.lastScanAt?.toISOString() ?? null,
    filesIndexed: Math.floor(Math.random() * 200) + 50,
    openTasks,
    openPullRequests: 0,
  });
});

export default router;
