import { Router } from "express";
import { db } from "@workspace/db";
import { constitutionRulesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function serialize(r: typeof constitutionRulesTable.$inferSelect) {
  return { ...r, createdAt: r.createdAt.toISOString() };
}

router.get("/", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });
  const rules = await db.select().from(constitutionRulesTable).where(eq(constitutionRulesTable.userId, req.user.id));
  res.json(rules.map(serialize));
});

router.post("/", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });
  const [rule] = await db.insert(constitutionRulesTable).values({
    userId: req.user.id,
    category: String(req.body.category),
    title: String(req.body.title),
    description: String(req.body.description),
    enforcement: req.body.enforcement ?? "warn",
    enabled: true,
  }).returning();
  res.status(201).json(serialize(rule));
});

router.patch("/:id", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });
  const id = Number(req.params.id);
  const updates: Record<string, unknown> = {};
  if (req.body.enabled !== undefined) updates.enabled = req.body.enabled;
  if (req.body.enforcement !== undefined) updates.enforcement = req.body.enforcement;
  if (req.body.title !== undefined) updates.title = req.body.title;
  if (req.body.description !== undefined) updates.description = req.body.description;
  const [rule] = await db.update(constitutionRulesTable).set(updates).where(eq(constitutionRulesTable.id, id)).returning();
  if (!rule || rule.userId !== req.user.id) return res.status(404).json({ error: "Not found" });
  res.json(serialize(rule));
});

router.delete("/:id", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });
  const id = Number(req.params.id);
  const [rule] = await db.select().from(constitutionRulesTable).where(eq(constitutionRulesTable.id, id));
  if (!rule || rule.userId !== req.user.id) return res.status(404).json({ error: "Not found" });
  await db.delete(constitutionRulesTable).where(eq(constitutionRulesTable.id, id));
  res.status(204).send();
});

export default router;
