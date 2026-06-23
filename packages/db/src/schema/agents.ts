import { pgTable, serial, text, integer, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const agentsTable = pgTable("agents", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  projectId: integer("project_id"),
  lastRunAt: timestamp("last_run_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const agentRunsTable = pgTable("agent_runs", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull(),
  projectId: integer("project_id").notNull(),
  status: text("status").notNull().default("running"),
  summary: text("summary"),
  recommendations: json("recommendations").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertAgentSchema = createInsertSchema(agentsTable).omit({ id: true, createdAt: true });
export const insertAgentRunSchema = createInsertSchema(agentRunsTable).omit({ id: true, createdAt: true });
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type InsertAgentRun = z.infer<typeof insertAgentRunSchema>;
export type Agent = typeof agentsTable.$inferSelect;
export type AgentRun = typeof agentRunsTable.$inferSelect;
