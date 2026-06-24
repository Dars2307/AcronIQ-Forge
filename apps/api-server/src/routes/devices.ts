import { Router } from "express";
import { query } from "../lib/db";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const router = Router();

function serialize(device: any) {
  return {
    ...device,
    agentVersion: device.agent_version ?? null,
    ollamaVersion: device.ollama_version ?? null,
    activeModel: device.active_model ?? null,
    lastHeartbeatAt: device.last_heartbeat_at?.toISOString() ?? null,
    createdAt: device.created_at?.toISOString() ?? null,
  };
}

// ── Pair by token (used by Forge Seed desktop app, no session auth required) ──
router.get("/pair", async (req, res) => {
  const token = req.query.token as string;
  if (!token) return res.status(400).json({ error: "token query param required" });

  const result = await query(
    "SELECT * FROM forge.devices WHERE pairing_token = $1",
    [token]
  );

  if (result.rows.length === 0) return res.status(404).json({ error: "Invalid or expired token" });

  const device = result.rows[0];
  return res.json({ deviceId: device.id, name: device.name, platform: device.platform });
});

// ── Download Forge Seed binary ──
router.get("/download/forge-seed.exe", (req, res) => {
  const exePath = path.join(process.cwd(), "public/downloads/forge-agent-setup.exe");
  if (!fs.existsSync(exePath)) {
    return res.status(404).json({ error: "Binary not yet built. Run: cd apps/desktop-agent && pnpm run tauri build" });
  }
  return res.download(exePath, "forge-agent-setup.exe");
});

// ── List devices (no auth required for now) ──
router.get("/", async (req, res) => {
  const result = await query("SELECT * FROM forge.devices ORDER BY created_at DESC");
  return res.json(result.rows.map(serialize));
});

// ── Register device (no auth required for now) ──
router.post("/", async (req, res) => {
  const pairingToken = crypto.randomBytes(32).toString("hex");
  try {
    const result = await query(
      `INSERT INTO forge.devices (name, platform, status, pairing_token, ollama_available)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        String(req.body.name),
        req.body.platform ?? "windows",
        "offline",
        pairingToken,
        false,
      ]
    );

    const device = result.rows[0];

    await query(
      `INSERT INTO forge.audit_entries (entity_type, entity_id, action, actor, details)
       VALUES ($1, $2, $3, $4, $5)`,
      ["device", device.id, "device_registered", "system", `Device "${device.name}" registered`]
    );

    return res.status(201).json(serialize(device));
  } catch (error) {
    console.error("Device registration error:", error);
    return res.status(500).json({ error: "Failed to register device" });
  }
});

// ── Get device by ID (no auth required for now) ──
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const result = await query("SELECT * FROM forge.devices WHERE id = $1", [id]);
  if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
  return res.json(serialize(result.rows[0]));
});

// ── Delete device (no auth required for now) ──
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const result = await query("SELECT * FROM forge.devices WHERE id = $1", [id]);
  if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });

  const device = result.rows[0];
  await query("DELETE FROM forge.devices WHERE id = $1", [id]);

  await query(
    `INSERT INTO forge.audit_entries (entity_type, entity_id, action, actor, details)
     VALUES ($1, $2, $3, $4, $5)`,
    ["device", id, "device_unlinked", "system", `Device "${device.name}" unlinked`]
  );

  return res.status(204).send();
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

  const deviceResult = await query("SELECT * FROM forge.devices WHERE id = $1", [id]);
  if (deviceResult.rows.length === 0 || deviceResult.rows[0].pairing_token !== token) {
    return res.status(401).json({ error: "Invalid pairing token" });
  }

  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  updates.push(`last_heartbeat_at = NOW()`);
  updates.push(`status = $${paramIndex++}`);
  values.push(req.body.status ?? "online");

  if (req.body.ollamaAvailable !== undefined) {
    updates.push(`ollama_available = $${paramIndex++}`);
    values.push(req.body.ollamaAvailable);
  }
  if (req.body.ollamaVersion !== undefined) {
    updates.push(`ollama_version = $${paramIndex++}`);
    values.push(req.body.ollamaVersion);
  }
  if (req.body.activeModel !== undefined) {
    updates.push(`active_model = $${paramIndex++}`);
    values.push(req.body.activeModel);
  }
  if (req.body.agentVersion !== undefined) {
    updates.push(`agent_version = $${paramIndex++}`);
    values.push(req.body.agentVersion);
  }

  values.push(id); // Add id for WHERE clause

  const result = await query(
    `UPDATE forge.devices SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
  return res.json(serialize(result.rows[0]));
});

export default router;
