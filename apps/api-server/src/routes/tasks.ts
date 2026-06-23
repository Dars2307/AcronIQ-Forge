import { Router } from "express";
import { query } from "../lib/db";
import { taskQueue } from "../lib/queues";

const router = Router();

function serializeTask(task: any, projectName?: string) {
  return {
    ...task,
    projectName: projectName ?? "",
    filesModified: task.files_modified as string[] || [],
    createdAt: task.created_at?.toISOString() ?? null,
    completedAt: task.completed_at?.toISOString() ?? null,
    plan: task.plan ?? null,
    buildStatus: task.build_status ?? null,
    confidenceScore: task.confidence_score ?? null,
  };
}

router.get("/", async (req, res) => {
  const { projectId, status } = req.query;
  let sql = "SELECT * FROM forge.tasks ORDER BY created_at DESC";
  const params: unknown[] = [];

  if (projectId || status) {
    const conditions: string[] = [];
    let paramIndex = 1;

    if (projectId) {
      conditions.push(`project_id = $${paramIndex++}`);
      params.push(Number(projectId));
    }
    if (status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(String(status));
    }

    sql += ` WHERE ${conditions.join(" AND ")}`;
  }

  const tasksResult = await query(sql, params);
  const tasks = tasksResult.rows;

  const projectsResult = await query("SELECT id, name FROM forge.projects");
  const projects = projectsResult.rows;
  const projectMap = Object.fromEntries(projects.map((p: any) => [p.id, p.name]));

  res.json(tasks.map((t: any) => serializeTask(t, projectMap[t.project_id])));
});

router.post("/", async (req, res) => {
  const { projectId, prompt, type } = req.body;
  const projectResult = await query("SELECT * FROM forge.projects WHERE id = $1", [Number(projectId)]);
  if (projectResult.rows.length === 0) return res.status(404).json({ error: "Project not found" });

  const project = projectResult.rows[0];

  const taskResult = await query(
    `INSERT INTO forge.tasks (project_id, prompt, status, created_at, updated_at)
     VALUES ($1, $2, $3, NOW(), NOW())
     RETURNING *`,
    [Number(projectId), String(prompt), "planning"]
  );

  const task = taskResult.rows[0];

  await query(
    `INSERT INTO forge.audit_entries (entity_type, entity_id, action, actor, details)
     VALUES ($1, $2, $3, $4, $5)`,
    ["task", task.id, "task_created", "user", `Task created: "${prompt}"`]
  );

  await taskQueue.add({ taskId: task.id }, { name: "complete_planning" });

  res.status(201).json(serializeTask(task, project.name));
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const taskResult = await query("SELECT * FROM forge.tasks WHERE id = $1", [id]);
  if (taskResult.rows.length === 0) return res.status(404).json({ error: "Not found" });

  const task = taskResult.rows[0];
  const projectResult = await query("SELECT name FROM forge.projects WHERE id = $1", [task.project_id]);
  const project = projectResult.rows[0];

  res.json(serializeTask(task, project?.name));
});

router.patch("/:id/approve", async (req, res) => {
  const id = Number(req.params.id);
  const taskResult = await query(
    "UPDATE forge.tasks SET status = 'running', updated_at = NOW() WHERE id = $1 RETURNING *",
    [id]
  );
  if (taskResult.rows.length === 0) return res.status(404).json({ error: "Not found" });

  const task = taskResult.rows[0];

  await query(
    `INSERT INTO forge.audit_entries (entity_type, entity_id, action, actor, details)
     VALUES ($1, $2, $3, $4, $5)`,
    ["task", id, "task_approved", "user", `Task #${id} approved for execution`]
  );

  await taskQueue.add({ taskId: task.id }, { name: "execute_task" });

  const projectResult = await query("SELECT name FROM forge.projects WHERE id = $1", [task.project_id]);
  const project = projectResult.rows[0];

  res.json(serializeTask(task, project?.name));
});

router.patch("/:id/reject", async (req, res) => {
  const id = Number(req.params.id);
  const taskResult = await query(
    "UPDATE forge.tasks SET status = 'rejected', completed_at = NOW(), updated_at = NOW() WHERE id = $1 RETURNING *",
    [id]
  );
  if (taskResult.rows.length === 0) return res.status(404).json({ error: "Not found" });

  const task = taskResult.rows[0];

  await query(
    `INSERT INTO forge.audit_entries (entity_type, entity_id, action, actor, details)
     VALUES ($1, $2, $3, $4, $5)`,
    ["task", id, "task_rejected", "user", `Task #${id} rejected`]
  );

  const projectResult = await query("SELECT name FROM forge.projects WHERE id = $1", [task.project_id]);
  const project = projectResult.rows[0];

  res.json(serializeTask(task, project?.name));
});

export default router;
