import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const pullRequestsTable = pgTable("pull_requests", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  taskId: integer("task_id"),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("open"),
  branch: text("branch").notNull(),
  url: text("url"),
  filesChanged: integer("files_changed").notNull().default(0),
  additions: integer("additions").notNull().default(0),
  deletions: integer("deletions").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  mergedAt: timestamp("merged_at"),
});

export const insertPullRequestSchema = createInsertSchema(pullRequestsTable).omit({ id: true, createdAt: true });
export type InsertPullRequest = z.infer<typeof insertPullRequestSchema>;
export type PullRequest = typeof pullRequestsTable.$inferSelect;
