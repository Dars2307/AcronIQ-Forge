import { Router } from "express";
import { query } from "../lib/db";

const router = Router();

function serialize(r: any) {
  return { ...r, createdAt: r.created_at?.toISOString() ?? null };
}

router.get("/", async (req, res) => {
  const result = await query("SELECT * FROM forge.constitution_rules ORDER BY created_at DESC");
  res.json(result.rows.map(serialize));
});

router.post("/", async (req, res) => {
  const result = await query(
    `INSERT INTO forge.constitution_rules (category, title, description, enforcement, enabled, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
     RETURNING *`,
    [String(req.body.category), String(req.body.title), String(req.body.description), req.body.enforcement ?? "warn", true]
  );
  const rule = result.rows[0];
  res.status(201).json(serialize(rule));
});

router.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (req.body.enabled !== undefined) {
    updates.push(`enabled = $${paramIndex++}`);
    values.push(req.body.enabled);
  }
  if (req.body.enforcement !== undefined) {
    updates.push(`enforcement = $${paramIndex++}`);
    values.push(req.body.enforcement);
  }
  if (req.body.title !== undefined) {
    updates.push(`title = $${paramIndex++}`);
    values.push(req.body.title);
  }
  if (req.body.description !== undefined) {
    updates.push(`description = $${paramIndex++}`);
    values.push(req.body.description);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  updates.push(`updated_at = NOW()`);
  values.push(id);

  const result = await query(
    `UPDATE forge.constitution_rules SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
  const rule = result.rows[0];
  res.json(serialize(rule));
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  await query("DELETE FROM forge.constitution_rules WHERE id = $1", [id]);
  res.status(204).send();
});

export default router;
