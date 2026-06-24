import { Router } from "express";
import { query } from "../lib/db";

const router = Router();

function serialize(m: any) {
  return {
    ...m,
    createdAt: m.created_at?.toISOString() ?? null,
    updatedAt: m.updated_at?.toISOString() ?? null,
  };
}

router.get("/", async (req, res) => {
  let sql = "SELECT * FROM forge.memory ORDER BY created_at DESC";
  const params: unknown[] = [];

  const result = await query(sql, params);
  return res.json(result.rows.map(serialize));
});

router.post("/", async (req, res) => {
  const result = await query(
    `INSERT INTO forge.memory (key, value, created_at, updated_at)
     VALUES ($1, $2, NOW(), NOW())
     RETURNING *`,
    [String(req.body.key), JSON.stringify(req.body.value)]
  );

  const entry = result.rows[0];
  return res.status(201).json(serialize(entry));
});

router.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (req.body.value !== undefined) {
    updates.push(`value = $${paramIndex++}`);
    values.push(JSON.stringify(req.body.value));
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  updates.push(`updated_at = NOW()`);
  values.push(id);

  const result = await query(
    `UPDATE forge.memory SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
  const entry = result.rows[0];
  return res.json(serialize(entry));
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  await query("DELETE FROM forge.memory WHERE id = $1", [id]);
  return res.status(204).send();
});

export default router;
