import { Router } from "express";
import { query } from "../lib/db";
import { agentRunQueue, taskQueue, projectScanQueue } from "../lib/queues";

const router = Router();

router.get("/summary", async (_req, res) => {
  const projectsResult = await query("SELECT * FROM forge.projects");
  const projects = projectsResult.rows;

  const tasksResult = await query("SELECT * FROM forge.tasks");
  const tasks = tasksResult.rows;

  const devicesResult = await query("SELECT * FROM forge.devices");
  const devices = devicesResult.rows;

  const agentsResult = await query("SELECT * FROM forge.agents");
  const agents = agentsResult.rows;

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const totalProjects = projects.length;
  const activeProjects = projects.filter((p: any) => p.status === "active").length;
  const openTasks = tasks.filter((t: any) => ["pending", "planning", "running"].includes(t.status)).length;
  const awaitingApproval = tasks.filter((t: any) => t.status === "awaiting_approval").length;
  const openPullRequests = 0;
  const criticalIssues = 0;
  const avgHealth = 100;
  const tasksThisWeek = tasks.filter((t: any) => new Date(t.created_at) >= oneWeekAgo).length;

  const connectedDevices = devices.filter((d: any) => d.status === "online").length;
  const agentsEnabled = agents.length;

  return res.json({
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
  const entriesResult = await query("SELECT * FROM forge.audit_entries ORDER BY created_at DESC LIMIT 20");
  const entries = entriesResult.rows;

  const projectsResult = await query("SELECT id, name FROM forge.projects");
  const projects = projectsResult.rows;
  const projectMap = Object.fromEntries(projects.map((p: any) => [p.id, p.name]));

  const activityTypeMap: Record<string, string> = {
    task_completed: "task_completed",
    pr_opened: "pr_opened",
    pr_merged: "pr_merged",
    scan_triggered: "scan_complete",
    task_approved: "task_approved",
    task_created: "task_completed",
    project_created: "scan_complete",
  };

  const items = entries.map((e: any) => ({
    id: e.id,
    type: activityTypeMap[e.action] ?? "task_completed",
    title: e.action.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
    description: e.details ?? e.action,
    projectName: e.entity_id ? (projectMap[e.entity_id] ?? "AcronIQ Platform") : "AcronIQ Platform",
    entityId: e.entity_id ?? null,
    severity: null,
    createdAt: e.created_at?.toISOString() ?? null,
  }));

  return res.json(items);
});

router.get("/queues", async (_req, res) => {
  return res.json([
    { name: "Agent Runs", counts: { active: 0, completed: 0, failed: 0, delayed: 0, waiting: 0, paused: 0 } },
    { name: "Tasks", counts: { active: 0, completed: 0, failed: 0, delayed: 0, waiting: 0, paused: 0 } },
    { name: "Project Scans", counts: { active: 0, completed: 0, failed: 0, delayed: 0, waiting: 0, paused: 0 } },
  ]);
});

export default router;
