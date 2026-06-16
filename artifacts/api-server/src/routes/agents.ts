import { Router } from "express";
import { db } from "@workspace/db";
import { agentsTable, agentRunsTable, projectsTable, auditEntriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const agentRecommendations: Record<string, string[]> = {
  repair: [
    "3 TypeScript type errors detected in authentication module — fix recommended",
    "Circular dependency found between auth and validation middleware — refactor advised",
    "Build failing due to unresolved module — patch available",
  ],
  architecture: [
    "Service layer is tightly coupled to database layer — consider repository pattern",
    "API routes contain business logic — move to dedicated service classes",
    "Missing input validation on 4 endpoints — add Zod schema validation",
  ],
  security: [
    "JWT expiration not enforced on refresh tokens — high severity",
    "SQL injection risk in dynamic query construction — immediate attention required",
    "Dependency audit: 3 packages with known CVEs — upgrade recommended",
  ],
  documentation: [
    "12 exported functions lack JSDoc documentation",
    "API routes missing OpenAPI descriptions",
    "README outdated — setup instructions do not match current configuration",
  ],
};

const agentSummaries: Record<string, string> = {
  repair: "Scan complete. Found 3 TypeScript errors, 1 circular dependency, and 1 build failure. All issues categorised by severity.",
  architecture: "Architecture review complete. Identified coupling concerns and missing validation layers. Recommendations generated without modifying any files.",
  security: "Security audit complete. Found 2 high-severity vulnerabilities and 3 dependency CVEs. No changes applied — awaiting approval.",
  documentation: "Documentation audit complete. Found 12 undocumented functions and 1 outdated README. Generated documentation stubs for review.",
};

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
    status: "running",
    recommendations: [],
  }).returning();

  await db.insert(auditEntriesTable).values({
    entityType: "agent",
    entityId: id,
    action: "agent_run_started",
    actor: req.user.id,
    details: `${agent.name} started on ${project.name}`,
  });

  setTimeout(async () => {
    const recs = agentRecommendations[agent.type] ?? ["Analysis complete — no critical issues found."];
    const summary = agentSummaries[agent.type] ?? "Analysis complete.";
    await db.update(agentRunsTable).set({
      status: "completed",
      summary,
      recommendations: recs,
      completedAt: new Date(),
    }).where(eq(agentRunsTable.id, run.id));
    await db.update(agentsTable).set({ lastRunAt: new Date() }).where(eq(agentsTable.id, id));
    await db.insert(auditEntriesTable).values({
      entityType: "agent",
      entityId: id,
      action: "agent_run_completed",
      actor: "forge-agent",
      details: `${agent.name} completed on ${project.name}`,
    });
  }, 5000);

  res.status(202).json(serializeRun(run));
});

router.get("/:id/runs", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });
  const id = Number(req.params.id);
  const runs = await db.select().from(agentRunsTable).where(eq(agentRunsTable.agentId, id)).orderBy(agentRunsTable.createdAt);
  res.json(runs.map(serializeRun));
});

export default router;
