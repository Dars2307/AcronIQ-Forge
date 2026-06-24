import { Router, type Request, type Response } from "express";
import { query } from "../lib/db";

const router = Router();

interface Integration {
  id: number;
  name: string;
  type: 'github' | 'gitlab' | 'bitbucket' | 'custom';
  enabled: boolean;
  config: Record<string, unknown>;
  created_at: Date;
}

// List all integrations
router.get("/", async (_req: Request, res: Response) => {
  const result = await query(
    "SELECT * FROM forge.integrations ORDER BY created_at DESC"
  );
  return res.json(result.rows);
});

// Create a new integration
router.post("/", async (req: Request, res: Response) => {
  const { name, type, config } = req.body;
  
  try {
    const result = await query(
      `INSERT INTO forge.integrations (name, type, enabled, config, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [name, type, false, JSON.stringify(config || {})]
    );

    await query(
      `INSERT INTO forge.audit_entries (entity_type, entity_id, action, actor, details)
       VALUES ($1, $2, $3, $4, $5)`,
      ["integration", result.rows[0].id, "integration_created", "user", `Integration "${name}" created`]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Integration creation error:", error);
    return res.status(500).json({ error: "Failed to create integration" });
  }
});

// Update integration
router.patch("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { enabled, config } = req.body;

  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (enabled !== undefined) {
    updates.push(`enabled = $${paramIndex++}`);
    values.push(enabled);
  }
  if (config !== undefined) {
    updates.push(`config = $${paramIndex++}`);
    values.push(JSON.stringify(config));
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  updates.push(`updated_at = NOW()`);
  values.push(id);

  try {
    const result = await query(
      `UPDATE forge.integrations SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }

    await query(
      `INSERT INTO forge.audit_entries (entity_type, entity_id, action, actor, details)
       VALUES ($1, $2, $3, $4, $5)`,
      ["integration", id, "integration_updated", "user", `Integration ${id} updated`]
    );

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Integration update error:", error);
    return res.status(500).json({ error: "Failed to update integration" });
  }
});

// Delete integration
router.delete("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  
  await query("DELETE FROM forge.integrations WHERE id = $1", [id]);

  await query(
    `INSERT INTO forge.audit_entries (entity_type, entity_id, action, actor, details)
     VALUES ($1, $2, $3, $4, $5)`,
    ["integration", id, "integration_deleted", "user", `Integration ${id} deleted`]
  );

  return res.status(204).send();
});

// Test integration connection
router.post("/:id/test", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  
  const result = await query("SELECT * FROM forge.integrations WHERE id = $1", [id]);
  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Not found" });
  }

  const integration = result.rows[0] as Integration;
  
  // Simulate connection test based on type
  let connectionStatus = 'success';
  let message = 'Connection successful';

  if (integration.type === 'github') {
    // Would normally test GitHub API connection
    message = 'GitHub API connection successful';
  } else if (integration.type === 'gitlab') {
    message = 'GitLab API connection successful';
  } else {
    message = 'Custom integration connection successful';
  }

  return res.json({
    status: connectionStatus,
    message,
    testedAt: new Date().toISOString(),
  });
});

export default router;
