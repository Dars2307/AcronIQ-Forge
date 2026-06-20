import { Router } from "express";
import { db } from "@workspace/db";
import {
  agentsTable,
  agentRunsTable,
  projectsTable,
  auditEntriesTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { agentRunQueue } from "../lib/queues";

const router = Router();

function serializeAgent(a: typeof agentsTable.$inferSelect) {
  return {
    ...a,
    projectId: a.projectId ?? null,
    lastRunAt: a.lastRunAt?.toISOString() ?? null,
    createdAt: a.createdAt.toISOString(),
  };
}

function serializeRun(r: typeof agentRunsTable.$inferSelect) {
  return {
    ...r,
    summary: r.summary ?? null,
    recommendations: r.recommendations as string[],
    createdAt: r.createdAt.toISOString(),
    completedAt: r.completedAt?.toISOString() ?? null,
  };
}

router.get("/", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });
  const agents = await db.select().from(agentsTable).where(eq(agentsTable.userId, req.user.id));
  res.json(agents.map(serializeAgent));
});

router.post("/", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });
  const [agent] = await db.insert(agentsTable).values({
    userId: req.user.id,
    type: String(req.body.type),
    name: String(req.body.name),
    description: String(req.body.description),
    projectId: req.body.projectId ? Number(req.body.projectId) : null,
    enabled: true,
  }).returning();
  res.status(201).json(serializeAgent(agent));
});

router.patch("/:id", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });
  const id = Number(req.params.id);
  const updates: Record<string, unknown> = {};
  if (req.body.enabled !== undefined) updates.enabled = req.body.enabled;
  if (req.body.projectId !== undefined) updates.projectId = req.body.projectId;
  const [agent] = await db.update(agentsTable).set(updates).where(eq(agentsTable.id, id)).returning();
  if (!agent) return res.status(404).json({ error: "Not found" });
  res.json(serializeAgent(agent));
});

router.post("/:id/run", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });
  const id = Number(req.params.id);
  const [agent] = await db.select().from(agentsTable).where(eq(agentsTable.id, id));
  if (!agent || agent.userId !== req.user.id) return res.status(404).json({ error: "Not found" });

  const projectId = Number(req.body.projectId);
  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, projectId));
  if (!project) return res.status(404).json({ error: "Project not found" });

  const [run] = await db.insert(agentRunsTable).values({
    agentId: id,
    projectId,
    status: "queued",
    recommendations: [],
  }).returning();

  await db.insert(auditEntriesTable).values({
    entityType: "agent",
    entityId: id,
    action: "agent_run_queued",
    actor: req.user.id,
    details: `${agent.name} run queued for ${project.name}`,
  });

  // Add job to the in-memory queue for the background worker to process
  await agentRunQueue.add("run-agent", {
    runId: run.id,
    agentId: agent.id,
    agentType: agent.type,
    projectName: project.name,
  });

  res.status(202).json(serializeRun(run));
});

router.get("/:id/runs", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });
  const id = Number(req.params.id);
  const runs = await db.select().from(agentRunsTable).where(eq(agentRunsTable.agentId, id)).orderBy(agentRunsTable.createdAt);
  res.json(runs.map(serializeRun));
});

export default router;
