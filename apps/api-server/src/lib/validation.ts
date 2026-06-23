import { z } from "zod";
import { type Request, type Response, type NextFunction } from "express";

// Generic validation middleware factory
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({
          error: "Validation failed",
          details: result.error.errors,
        });
        return;
      }
      req.body = result.data;
      next();
    } catch (error) {
      res.status(400).json({ error: "Invalid request body" });
    }
  };
}

export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.query);
      if (!result.success) {
        res.status(400).json({
          error: "Validation failed",
          details: result.error.errors,
        });
        return;
      }
      req.query = result.data as any;
      next();
    } catch (error) {
      res.status(400).json({ error: "Invalid request query" });
    }
  };
}

export function validateParams<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.params);
      if (!result.success) {
        res.status(400).json({
          error: "Validation failed",
          details: result.error.errors,
        });
        return;
      }
      // Don't reassign to req.params to avoid type conflicts
      // Route handlers can access validated params via req.params (strings)
      next();
    } catch (error) {
      res.status(400).json({ error: "Invalid request params" });
    }
  };
}

// Common validation schemas
export const schemas = {
  // Project schemas
  projectCreate: z.object({
    name: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
    repositoryUrl: z.string().url().optional(),
  }),
  
  projectUpdate: z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).optional(),
    repositoryUrl: z.string().url().optional(),
  }),
  
  // Device schemas
  deviceRegister: z.object({
    name: z.string().min(1).max(255),
    platform: z.enum(["windows", "macos", "linux"]),
  }),
  
  deviceHeartbeat: z.object({
    status: z.enum(["online", "idle", "offline"]),
    ollamaAvailable: z.boolean().optional(),
    ollamaVersion: z.string().optional(),
    activeModel: z.string().optional(),
  }),
  
  // Task schemas
  taskCreate: z.object({
    projectId: z.number().int().positive(),
    title: z.string().min(1).max(255),
    description: z.string().max(2000).optional(),
    priority: z.enum(["low", "medium", "high"]).default("medium"),
    status: z.enum(["pending", "in_progress", "completed", "failed"]).default("pending"),
  }),
  
  taskUpdate: z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(2000).optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    status: z.enum(["pending", "in_progress", "completed", "failed"]).optional(),
  }),
  
  // Integration schemas
  integrationCreate: z.object({
    name: z.string().min(1).max(255),
    type: z.enum(["github", "gitlab", "bitbucket", "custom"]),
    config: z.record(z.unknown()).optional(),
  }),
  
  integrationUpdate: z.object({
    enabled: z.boolean().optional(),
    config: z.record(z.unknown()).optional(),
  }),
  
  // Conversation schemas
  conversationCreate: z.object({
    projectId: z.number().int().positive().optional(),
    title: z.string().min(1).max(255),
  }),
  
  messageCreate: z.object({
    content: z.string().min(1).max(10000),
    role: z.enum(["user", "assistant", "system"]),
  }),
  
  // Constitution rule schemas
  constitutionRuleCreate: z.object({
    category: z.enum(["language", "security", "structure", "git", "testing", "architecture"]),
    title: z.string().min(1).max(255),
    description: z.string().min(1).max(2000),
    enforcement: z.enum(["block", "warn", "info"]),
    enabled: z.boolean().default(true),
  }),
  
  constitutionRuleUpdate: z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().min(1).max(2000).optional(),
    enforcement: z.enum(["block", "warn", "info"]).optional(),
    enabled: z.boolean().optional(),
  }),
  
  // Memory schemas
  memoryCreate: z.object({
    category: z.enum(["context", "decision", "fact", "pattern"]),
    content: z.string().min(1).max(5000),
    source: z.string().max(255).optional(),
    tags: z.array(z.string()).optional(),
  }),
  
  memoryUpdate: z.object({
    content: z.string().min(1).max(5000).optional(),
    category: z.enum(["context", "decision", "fact", "pattern"]).optional(),
    tags: z.array(z.string()).optional(),
  }),
  
  // Common ID parameter
  idParam: z.object({
    id: z.string().regex(/^\d+$/),
  }),
  
  // Pagination query
  paginationQuery: z.object({
    limit: z.string().regex(/^\d+$/).transform(Number).default("50"),
    offset: z.string().regex(/^\d+$/).transform(Number).default("0"),
  }),
};
