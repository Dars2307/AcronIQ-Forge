import { Router } from "express";
import { db } from "@workspace/db";
import { memoryEntriesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

function serialize(m: typeof memoryEntriesTable.$inferSelect) {
  return {
    ...m,
    projectId: m.projectId ?? null,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });
  let entries = await db.select().from(memoryEntriesTable).where(eq(memoryEntriesTable.userId, req.user.id));
  const { projectId, category } = req.query;
  if (projectId) entries = entries.filter(e => e.projectId === Number(projectId));
  if (category) entries = entries.filter(e => e.category === String(category));
  res.json(entries.map(serialize));
});

router.post("/", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });
  const [entry] = await db.insert(memoryEntriesTable).values({
    userId: req.user.id,
    category: String(req.body.category),
    key: String(req.body.key),
    value: String(req.body.value),
    projectId: req.body.projectId ? Number(req.body.projectId) : null,
    source: req.body.source ?? "manual",
  }).returning();
  res.status(201).json(serialize(entry));
});

router.patch("/:id", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });
  const id = Number(req.params.id);
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (req.body.value !== undefined) updates.value = req.body.value;
  if (req.body.category !== undefined) updates.category = req.body.category;
  const [entry] = await db.update(memoryEntriesTable).set(updates).where(eq(memoryEntriesTable.id, id)).returning();
  if (!entry || entry.userId !== req.user.id) return res.status(404).json({ error: "Not found" });
  res.json(serialize(entry));
});

router.delete("/:id", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });
  const id = Number(req.params.id);
  const [entry] = await db.select().from(memoryEntriesTable).where(eq(memoryEntriesTable.id, id));
  if (!entry || entry.userId !== req.user.id) return res.status(404).json({ error: "Not found" });
  await db.delete(memoryEntriesTable).where(eq(memoryEntriesTable.id, id));
  res.status(204).send();
});

export default router;
