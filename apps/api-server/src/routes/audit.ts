import { Router } from "express";
import { query } from "../lib/db";

const router = Router();

router.get("/", async (req, res) => {
  const { entityType } = req.query;
  let sql = "SELECT * FROM forge.audit_entries ORDER BY created_at DESC";
  const params: unknown[] = [];

  if (entityType) {
    sql += " WHERE entity_type = $1";
    params.push(String(entityType));
  }

  const result = await query(sql, params);
  res.json(result.rows.map((e: any) => ({
    ...e,
    entityId: e.entity_id ?? null,
    details: e.details ?? null,
    createdAt: e.created_at?.toISOString() ?? null,
  })));
});

export default router;
