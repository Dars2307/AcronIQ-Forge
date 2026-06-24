import { Router, type Request, type Response } from "express";
import { query } from "../lib/db";
import { projectScanQueue } from "../lib/queues";
import { validateBody, validateParams, schemas } from "../lib/validation";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const result = await query("SELECT * FROM forge.projects ORDER BY created_at DESC");
  return res.json(result.rows.map((p: any) => ({
    ...p,
    lastScanAt: p.last_scan_at?.toISOString() ?? null,
    createdAt: p.created_at?.toISOString() ?? null,
  })));
});

router.post("/", validateBody(schemas.projectCreate), async (req: Request, res: Response) => {
  const result = await query(
    `INSERT INTO forge.projects (name, description, status, repository_url, created_at, updated_at)
     VALUES ($1, $2, $3, $4, NOW(), NOW())
     RETURNING *`,
    [req.body.name, req.body.description, "active", req.body.repositoryUrl || null]
  );

  const project = result.rows[0];

  await query(
    `INSERT INTO forge.audit_entries (entity_type, entity_id, action, actor, details)
     VALUES ($1, $2, $3, $4, $5)`,
    ["project", project.id, "project_created", "user", `Project "${project.name}" added`]
  );

  return res.status(201).json({
    ...project,
    lastScanAt: project.last_scan_at?.toISOString() ?? null,
    createdAt: project.created_at?.toISOString() ?? null,
  });
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const result = await query("SELECT * FROM forge.projects WHERE id = $1", [id]);
  if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
  const project = result.rows[0];
  return res.json({
    ...project,
    lastScanAt: project.last_scan_at?.toISOString() ?? null,
    createdAt: project.created_at?.toISOString() ?? null,
  });
});

router.patch("/:id", validateParams(schemas.idParam), validateBody(schemas.projectUpdate), async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (req.body.name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(req.body.name);
  }
  if (req.body.description !== undefined) {
    updates.push(`description = $${paramIndex++}`);
    values.push(req.body.description);
  }
  if (req.body.status !== undefined) {
    updates.push(`status = $${paramIndex++}`);
    values.push(req.body.status);
  }
  if (req.body.repositoryUrl !== undefined) {
    updates.push(`repository_url = $${paramIndex++}`);
    values.push(req.body.repositoryUrl);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  updates.push(`updated_at = NOW()`);
  values.push(id);

  const result = await query(
    `UPDATE forge.projects SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
  const project = result.rows[0];
  return res.json({
    ...project,
    lastScanAt: project.last_scan_at?.toISOString() ?? null,
    createdAt: project.created_at?.toISOString() ?? null,
  });
});

router.delete("/:id", validateParams(schemas.idParam), async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await query("DELETE FROM forge.projects WHERE id = $1", [id]);
  return res.status(204).send();
});

router.post("/:id/scan", async (req, res) => {
  const id = Number(req.params.id);
  const projectResult = await query("SELECT * FROM forge.projects WHERE id = $1", [id]);
  if (projectResult.rows.length === 0) return res.status(404).json({ error: "Not found" });

  const project = projectResult.rows[0];

  await query("UPDATE forge.projects SET status = 'scanning', last_scan_at = NOW() WHERE id = $1", [id]);

  const taskResult = await query(
    `INSERT INTO forge.tasks (project_id, prompt, status, created_at, updated_at)
     VALUES ($1, $2, $3, NOW(), NOW())
     RETURNING *`,
    [id, `Automated scan of ${project.name}`, "running"]
  );

  const task = taskResult.rows[0];

  await query(
    `INSERT INTO forge.audit_entries (entity_type, entity_id, action, actor, details)
     VALUES ($1, $2, $3, $4, $5)`,
    ["project", id, "scan_triggered", "user", `Scan triggered for "${project.name}"`]
  );

  await projectScanQueue.add({ projectId: id, taskId: task.id });

  return res.status(202).json({
    ...task,
    projectName: project.name,
    filesModified: task.files_modified as string[] || [],
    createdAt: task.created_at?.toISOString() ?? null,
    completedAt: task.completed_at?.toISOString() ?? null,
    buildStatus: task.build_status ?? null,
    confidenceScore: task.confidence_score ?? null,
  });
});

router.get("/:id/summary", async (req, res) => {
  const id = Number(req.params.id);
  const projectResult = await query("SELECT * FROM forge.projects WHERE id = $1", [id]);
  if (projectResult.rows.length === 0) return res.status(404).json({ error: "Not found" });

  const project = projectResult.rows[0];

  const tasksResult = await query("SELECT * FROM forge.tasks WHERE project_id = $1", [id]);
  const tasks = tasksResult.rows;
  const openTasks = tasks.filter((t: any) => ["pending", "planning", "awaiting_approval", "running"].includes(t.status)).length;

  return res.json({
    projectId: id,
    healthScore: 100,
    openIssues: 0,
    criticalIssues: 0,
    lastScanAt: project.last_scan_at?.toISOString() ?? null,
    filesIndexed: Math.floor(Math.random() * 200) + 50,
    openTasks,
    openPullRequests: 0,
  });
});

export default router;
