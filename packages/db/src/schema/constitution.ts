import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const constitutionRulesTable = pgTable("constitution_rules", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  enforcement: text("enforcement").notNull().default("warn"),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertConstitutionRuleSchema = createInsertSchema(constitutionRulesTable).omit({ id: true, createdAt: true });
export type InsertConstitutionRule = z.infer<typeof insertConstitutionRuleSchema>;
export type ConstitutionRule = typeof constitutionRulesTable.$inferSelect;
