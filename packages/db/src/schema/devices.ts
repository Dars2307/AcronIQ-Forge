import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const devicesTable = pgTable("devices", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  name: text("name").notNull(),
  platform: text("platform").notNull().default("windows"),
  status: text("status").notNull().default("offline"),
  pairingToken: text("pairing_token").notNull(),
  agentVersion: text("agent_version"),
  ollamaAvailable: boolean("ollama_available").notNull().default(false),
  ollamaVersion: text("ollama_version"),
  activeModel: text("active_model"),
  lastHeartbeatAt: timestamp("last_heartbeat_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDeviceSchema = createInsertSchema(devicesTable).omit({ id: true, createdAt: true });
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type Device = typeof devicesTable.$inferSelect;
