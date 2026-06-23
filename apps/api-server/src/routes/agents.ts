import { Router } from "express";
import { query } from "../lib/db";
import { agentRunQueue } from "../lib/queues";

const router = Router();

function serializeAgent(a: any) {
  return {
    ...a,
    projectId: a.project_id ?? null,
    lastRunAt: a.last_run_at?.toISOString() ?? null,
    createdAt: a.created_at?.toISOString() ?? null,
  };
}

function serializeRun(r: any) {
  return {
    ...r,
    summary: r.summary ?? null,
    recommendations: r.recommendations as string[] || [],
    createdAt: r.created_at?.toISOString() ?? null,
    completedAt: r.completed_at?.toISOString() ?? null,
  };
}

router.get("/", async (req, res) => {
  const result = await query("SELECT * FROM forge.agents ORDER BY created_at DESC");
  res.json(result.rows.map(serializeAgent));
});

router.post("/", async (req, res) => {
  const result = await query(
    `INSERT INTO forge.agents (project_id, name, agent_type, created_at, updated_at)
     VALUES ($1, $2, $3, NOW(), NOW())
     RETURNING *`,
    [req.body.projectId ? Number(req.body.projectId) : null, String(req.body.name), String(req.body.type)]
  );

  const agent = result.rows[0];
  res.status(201).json(serializeAgent(agent));
});

router.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (req.body.projectId !== undefined) {
    updates.push(`project_id = $${paramIndex++}`);
    values.push(req.body.projectId ? Number(req.body.projectId) : null);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  updates.push(`updated_at = NOW()`);
  values.push(id);

  const result = await query(
    `UPDATE forge.agents SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
  const agent = result.rows[0];
  res.json(serializeAgent(agent));
});

router.post("/:id/run", async (req, res) => {
  const id = Number(req.params.id);
  const agentResult = await query("SELECT * FROM forge.agents WHERE id = $1", [id]);
  if (agentResult.rows.length === 0) return res.status(404).json({ error: "Not found" });

  const agent = agentResult.rows[0];

  const projectId = Number(req.body.projectId);
  const projectResult = await query("SELECT * FROM forge.projects WHERE id = $1", [projectId]);
  if (projectResult.rows.length === 0) return res.status(404).json({ error: "Project not found" });

  const project = projectResult.rows[0];

  const runResult = await query(
    `INSERT INTO forge.agent_runs (agent_id, status, created_at)
     VALUES ($1, $2, NOW())
     RETURNING *`,
    [id, "queued"]
  );

  const run = runResult.rows[0];

  await query(
    `INSERT INTO forge.audit_entries (entity_type, entity_id, action, actor, details)
     VALUES ($1, $2, $3, $4, $5)`,
    ["agent", id, "agent_run_queued", "user", `${agent.name} run queued for ${project.name}`]
  );

  await agentRunQueue.add({
    runId: run.id,
    agentId: agent.id,
    agentType: agent.agent_type,
    projectName: project.name,
  });

  res.status(202).json(serializeRun(run));
});

router.get("/:id/runs", async (req, res) => {
  const id = Number(req.params.id);
  const result = await query("SELECT * FROM forge.agent_runs WHERE agent_id = $1 ORDER BY created_at DESC", [id]);
  res.json(result.rows.map(serializeRun));
});

export default router;
