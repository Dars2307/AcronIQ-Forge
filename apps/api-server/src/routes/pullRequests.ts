import { Router } from "express";
import { query } from "../lib/db";

const router = Router();

function serialize(pr: any, projectName?: string) {
  return {
    ...pr,
    projectName: projectName ?? "",
    description: pr.description ?? null,
    url: pr.url ?? null,
    taskId: pr.task_id ?? null,
    createdAt: pr.created_at?.toISOString() ?? null,
    mergedAt: pr.merged_at?.toISOString() ?? null,
  };
}

router.get("/", async (req, res) => {
  const { status } = req.query;
  let sql = "SELECT * FROM forge.pull_requests ORDER BY created_at DESC";
  const params: unknown[] = [];

  if (status) {
    sql += " WHERE status = $1";
    params.push(String(status));
  }

  const prResult = await query(sql, params);
  const prs = prResult.rows;

  const projectResult = await query("SELECT id, name FROM forge.projects");
  const projects = projectResult.rows;
  const projectMap = Object.fromEntries(projects.map((p: any) => [p.id, p.name]));

  return res.json(prs.map((p: any) => serialize(p, projectMap[p.project_id])));
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const prResult = await query("SELECT * FROM forge.pull_requests WHERE id = $1", [id]);
  if (prResult.rows.length === 0) return res.status(404).json({ error: "Not found" });

  const pr = prResult.rows[0];
  const projectResult = await query("SELECT name FROM forge.projects WHERE id = $1", [pr.project_id]);
  const project = projectResult.rows[0];

  return res.json(serialize(pr, project?.name));
});

router.patch("/:id/merge", async (req, res) => {
  const id = Number(req.params.id);
  const prResult = await query(
    "UPDATE forge.pull_requests SET status = 'merged', merged_at = NOW() WHERE id = $1 RETURNING *",
    [id]
  );
  if (prResult.rows.length === 0) return res.status(404).json({ error: "Not found" });

  const pr = prResult.rows[0];

  await query(
    `INSERT INTO forge.audit_entries (entity_type, entity_id, action, actor, details)
     VALUES ($1, $2, $3, $4, $5)`,
    ["pull_request", id, "pr_merged", "user", `PR #${id} "${pr.title}" merged`]
  );

  const projectResult = await query("SELECT name FROM forge.projects WHERE id = $1", [pr.project_id]);
  const project = projectResult.rows[0];

  return res.json(serialize(pr, project?.name));
});

router.patch("/:id/close", async (req, res) => {
  const id = Number(req.params.id);
  const prResult = await query(
    "UPDATE forge.pull_requests SET status = 'closed' WHERE id = $1 RETURNING *",
    [id]
  );
  if (prResult.rows.length === 0) return res.status(404).json({ error: "Not found" });

  const pr = prResult.rows[0];

  await query(
    `INSERT INTO forge.audit_entries (entity_type, entity_id, action, actor, details)
     VALUES ($1, $2, $3, $4, $5)`,
    ["pull_request", id, "pr_closed", "user", `PR #${id} "${pr.title}" closed without merge`]
  );

  const projectResult = await query("SELECT name FROM forge.projects WHERE id = $1", [pr.project_id]);
  const project = projectResult.rows[0];

  return res.json(serialize(pr, project?.name));
});

export default router;
