import { Router } from "express";
import { db } from "@workspace/db";
import {
  projectsTable,
  tasksTable,
  pullRequestsTable,
  issuesTable,
  auditEntriesTable,
  devicesTable,
  agentsTable,
} from "@workspace/db";

const router = Router();

router.get("/summary", async (_req, res) => {
  const projects = await db.select().from(projectsTable);
  const tasks = await db.select().from(tasksTable);
  const prs = await db.select().from(pullRequestsTable);
  const issues = await db.select().from(issuesTable);

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === "active").length;
  const openTasks = tasks.filter(t => ["pending", "planning", "running"].includes(t.status)).length;
  const awaitingApproval = tasks.filter(t => t.status === "awaiting_approval").length;
  const openPullRequests = prs.filter(p => p.status === "open").length;
  const criticalIssues = issues.filter(i => i.severity === "critical" && i.status === "open").length;
  const avgHealth = projects.length
    ? Math.round(projects.reduce((s, p) => s + p.healthScore, 0) / projects.length)
    : 0;
  const tasksThisWeek = tasks.filter(t => t.createdAt >= oneWeekAgo).length;

  const devices = await db.select().from(devicesTable);
  const agents = await db.select().from(agentsTable);
  const connectedDevices = devices.filter(d => d.status === "online").length;
  const agentsEnabled = agents.filter(a => a.enabled).length;

  res.json({
    totalProjects,
    activeProjects,
    openTasks,
    awaitingApproval,
    openPullRequests,
    criticalIssues,
    avgHealthScore: avgHealth,
    tasksThisWeek,
    connectedDevices,
    agentsEnabled,
  });
});

router.get("/activity", async (_req, res) => {
  const entries = await db.select().from(auditEntriesTable).orderBy(auditEntriesTable.createdAt);

  const projects = await db.select().from(projectsTable);
  const projectMap = Object.fromEntries(projects.map(p => [p.id, p.name]));

  const activityTypeMap: Record<string, string> = {
    task_completed: "task_completed",
    pr_opened: "pr_opened",
    pr_merged: "pr_merged",
    scan_triggered: "scan_complete",
    task_approved: "task_approved",
    task_created: "task_completed",
    project_created: "scan_complete",
  };

  const items = entries.slice(-20).reverse().map((e, i) => ({
    id: e.id,
    type: activityTypeMap[e.action] ?? "task_completed",
    title: e.action.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    description: e.details ?? e.action,
    projectName: e.entityId ? (projectMap[e.entityId] ?? "AcronIQ Platform") : "AcronIQ Platform",
    entityId: e.entityId ?? null,
    severity: null,
    createdAt: e.createdAt.toISOString(),
  }));

  res.json(items);
});

export default router;
