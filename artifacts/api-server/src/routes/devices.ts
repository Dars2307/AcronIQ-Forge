import { Router } from "express";
import { db } from "@workspace/db";
import { devicesTable, auditEntriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";

const router = Router();

function serialize(d: typeof devicesTable.$inferSelect) {
  return {
    ...d,
    agentVersion: d.agentVersion ?? null,
    ollamaVersion: d.ollamaVersion ?? null,
    activeModel: d.activeModel ?? null,
    lastHeartbeatAt: d.lastHeartbeatAt?.toISOString() ?? null,
    createdAt: d.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });
  const devices = await db.select().from(devicesTable).where(eq(devicesTable.userId, req.user.id));
  res.json(devices.map(serialize));
});

router.post("/", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });
  const pairingToken = randomBytes(32).toString("hex");
  const [device] = await db.insert(devicesTable).values({
    userId: req.user.id,
    name: String(req.body.name),
    platform: req.body.platform ?? "windows",
    status: "offline",
    pairingToken,
    ollamaAvailable: false,
  }).returning();
  await db.insert(auditEntriesTable).values({
    entityType: "device",
    entityId: device.id,
    action: "device_registered",
    actor: req.user.id,
    details: `Device "${device.name}" registered`,
  });
  res.status(201).json(serialize(device));
});

router.get("/:id", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });
  const id = Number(req.params.id);
  const [device] = await db.select().from(devicesTable).where(eq(devicesTable.id, id));
  if (!device || device.userId !== req.user.id) return res.status(404).json({ error: "Not found" });
  res.json(serialize(device));
});

router.delete("/:id", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });
  const id = Number(req.params.id);
  const [device] = await db.select().from(devicesTable).where(eq(devicesTable.id, id));
  if (!device || device.userId !== req.user.id) return res.status(404).json({ error: "Not found" });
  await db.delete(devicesTable).where(eq(devicesTable.id, id));
  await db.insert(auditEntriesTable).values({
    entityType: "device",
    entityId: id,
    action: "device_unlinked",
    actor: req.user.id,
    details: `Device "${device.name}" unlinked`,
  });
  res.status(204).send();
});

router.patch("/:id/heartbeat", async (req, res) => {
  const id = Number(req.params.id);
  const updates: Record<string, unknown> = { lastHeartbeatAt: new Date(), status: "online" };
  if (req.body.status !== undefined) updates.status = req.body.status;
  if (req.body.ollamaAvailable !== undefined) updates.ollamaAvailable = req.body.ollamaAvailable;
  if (req.body.ollamaVersion !== undefined) updates.ollamaVersion = req.body.ollamaVersion;
  if (req.body.activeModel !== undefined) updates.activeModel = req.body.activeModel;
  if (req.body.agentVersion !== undefined) updates.agentVersion = req.body.agentVersion;
  const [device] = await db.update(devicesTable).set(updates).where(eq(devicesTable.id, id)).returning();
  if (!device) return res.status(404).json({ error: "Not found" });
  res.json(serialize(device));
});

export default router;
