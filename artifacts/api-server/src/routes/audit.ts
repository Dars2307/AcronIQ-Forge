import { Router } from "express";
import { db } from "@workspace/db";
import { auditEntriesTable } from "@workspace/db";

const router = Router();

router.get("/", async (req, res) => {
  const { entityType } = req.query;
  let entries = await db.select().from(auditEntriesTable).orderBy(auditEntriesTable.createdAt);
  if (entityType) entries = entries.filter(e => e.entityType === String(entityType));
  res.json(entries.map(e => ({
    ...e,
    entityId: e.entityId ?? null,
    details: e.details ?? null,
    createdAt: e.createdAt.toISOString(),
  })));
});

export default router;
