import { Router } from "express";
import { db } from "@workspace/db";
import { devicesTable, auditEntriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import path from "path";
import fs from "fs";

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

// ── Pair by token (used by Forge Seed desktop app, no session auth required) ──
router.get("/pair", async (req, res) => {
  const token = req.query.token as string;
  if (!token) return res.status(400).json({ error: "token query param required" });

  const [device] = await db
    .select()
    .from(devicesTable)
    .where(eq(devicesTable.pairingToken, token));

  if (!device) return res.status(404).json({ error: "Invalid or expired token" });

  res.json({ deviceId: device.id, name: device.name, platform: device.platform });
});

// ── Download Forge Seed binary ──
router.get("/download/forge-seed.exe", (req, res) => {
  const exePath = path.join(__dirname, "../../public/forge-seed.exe");
  if (!fs.existsSync(exePath)) {
    return res.status(404).json({ error: "Binary not yet built. Run: pnpm --filter @workspace/forge-seed run build:win" });
  }
  res.download(exePath, "forge-seed.exe");
});

// ── List devices (no auth required for now) ──
router.get("/", async (req, res) => {
  const devices = await db.select().from(devicesTable).where(eq(devicesTable.userId, "1"));
  res.json(devices.map(serialize));
});

// ── Register device (no auth required for now) ──
router.post("/", async (req, res) => {
  const pairingToken = randomBytes(32).toString("hex");
  const [device] = await db
    .insert(devicesTable)
    .values({
      userId: "1", // Default user ID until proper auth is implemented
      name: String(req.body.name),
      platform: req.body.platform ?? "windows",
      status: "offline",
      pairingToken,
      ollamaAvailable: false,
    })
    .returning();
  await db.insert(auditEntriesTable).values({
    entityType: "device",
    entityId: device.id,
    action: "device_registered",
    actor: "system",
    details: `Device "${device.name}" registered`,
  });
  res.status(201).json(serialize(device));
});

// ── Get device by ID (no auth required for now) ──
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [device] = await db.select().from(devicesTable).where(eq(devicesTable.id, id));
  if (!device || device.userId !== "1") return res.status(404).json({ error: "Not found" });
  res.json(serialize(device));
});

// ── Delete device (no auth required for now) ──
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [device] = await db.select().from(devicesTable).where(eq(devicesTable.id, id));
  if (!device || device.userId !== "1") return res.status(404).json({ error: "Not found" });
  await db.delete(devicesTable).where(eq(devicesTable.id, id));
  await db.insert(auditEntriesTable).values({
    entityType: "device",
    entityId: id,
    action: "device_unlinked",
    actor: "system",
    details: `Device "${device.name}" unlinked`,
  });
  res.status(204).send();
});

// ── Heartbeat — accepts Bearer token (for Forge Seed) ──
router.patch("/:id/heartbeat", async (req, res) => {
  const id = Number(req.params.id);

  // Verify auth: valid Bearer token matching this device
  const authHeader = req.headers.authorization ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.slice(7).trim();
  const [existingDevice] = await db.select().from(devicesTable).where(eq(devicesTable.id, id));
  if (!existingDevice || existingDevice.pairingToken !== token) {
    return res.status(401).json({ error: "Invalid pairing token" });
  }

  const updates: Record<string, unknown> = {
    lastHeartbeatAt: new Date(),
    status: req.body.status ?? "online",
  };
  if (req.body.ollamaAvailable !== undefined) updates.ollamaAvailable = req.body.ollamaAvailable;
  if (req.body.ollamaVersion !== undefined) updates.ollamaVersion = req.body.ollamaVersion;
  if (req.body.activeModel !== undefined) updates.activeModel = req.body.activeModel;
  if (req.body.agentVersion !== undefined) updates.agentVersion = req.body.agentVersion;

  const [device] = await db
    .update(devicesTable)
    .set(updates)
    .where(eq(devicesTable.id, id))
    .returning();
  if (!device) return res.status(404).json({ error: "Not found" });
  res.json(serialize(device));
});

export default router;
