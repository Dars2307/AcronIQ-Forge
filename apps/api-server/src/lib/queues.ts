import { query } from "./db";

// ─── Agent Run Queue ──────────────────────────────────────────────────────────

const agentRecommendations: Record<string, string[]> = {
  repair: [
    "3 TypeScript type errors detected in authentication module — fix recommended",
    "Circular dependency found between auth and validation middleware — refactor advised",
    "Build failing due to unresolved module — patch available",
  ],
  architecture: [
    "Service layer is tightly coupled to database layer — consider repository pattern",
    "API routes contain business logic — move to dedicated service classes",
    "Missing input validation on 4 endpoints — add Zod schema validation",
  ],
  security: [
    "JWT expiration not enforced on refresh tokens — high severity",
    "SQL injection risk in dynamic query construction — immediate attention required",
    "Dependency audit: 3 packages with known CVEs — upgrade recommended",
  ],
  documentation: [
    "12 exported functions lack JSDoc documentation",
    "API routes missing OpenAPI descriptions",
    "README outdated — setup instructions do not match current configuration",
  ],
};

const agentSummaries: Record<string, string> = {
  repair: "Scan complete. Found 3 TypeScript errors, 1 circular dependency, and 1 build failure. All issues categorised by severity.",
  architecture: "Architecture review complete. Identified coupling concerns and missing validation layers. Recommendations generated without modifying any files.",
  security: "Security audit complete. Found 2 high-severity vulnerabilities and 3 dependency CVEs. No changes applied — awaiting approval.",
  documentation: "Documentation audit complete. Found 12 undocumented functions and 1 outdated README. Generated documentation stubs for review.",
};

interface AgentRunJobData { runId: number; agentId: number; agentType: string; projectName: string; }

export const agentRunQueue = {
  async add(data: AgentRunJobData) {
    console.log(`[Agent Queue] Adding job for run ID: ${data.runId}`);
    await processAgentRun(data);
  }
};

async function processAgentRun(data: AgentRunJobData) {
  const { runId, agentId, agentType, projectName } = data;
  console.log(`[Agent Worker] Processing job for run ID: ${runId}`);
  try {
    await query("UPDATE forge.agent_runs SET status = 'running' WHERE id = $1", [runId]);
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Simulate work
    const recs = agentRecommendations[agentType] ?? ["Analysis complete — no critical issues found."];
    const summary = agentSummaries[agentType] ?? "Analysis complete.";
    await query(
      `UPDATE forge.agent_runs SET status = 'completed', summary = $1, recommendations = $2, completed_at = NOW() WHERE id = $3`,
      [summary, recs, runId]
    );
    await query("UPDATE forge.agents SET last_run_at = NOW() WHERE id = $1", [agentId]);
    await query(
      `INSERT INTO forge.audit_entries (entity_type, entity_id, action, actor, details)
       VALUES ($1, $2, $3, $4, $5)`,
      ["agent", agentId, "agent_run_completed", "forge-agent", `Agent run completed on ${projectName}`]
    );
    console.log(`[Agent Worker] Completed job for run ID: ${runId}`);
  } catch (error) {
    console.error(`[Agent Worker] Error processing job for run ID: ${runId}`, error);
    await query(
      `UPDATE forge.agent_runs SET status = 'failed', summary = 'The agent run failed due to an internal error.', completed_at = NOW() WHERE id = $1`,
      [runId]
    );
  }
}

// ─── Task Queue ───────────────────────────────────────────────────────────────

interface TaskJobData { taskId: number; }

export const taskQueue = {
  async add(data: TaskJobData, opts: { name: string }) {
    console.log(`[Task Queue] Adding job for task ID: ${data.taskId}, action: ${opts.name}`);
    await processTask(data, opts.name);
  }
};

async function processTask(data: TaskJobData, action: string) {
  const { taskId } = data;
  console.log(`[Task Worker] Processing job for task ID: ${taskId}, action: ${action}`);
  try {
    switch (action) {
      case "complete_planning":
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate planning
        await query("UPDATE forge.tasks SET status = 'awaiting_approval', updated_at = NOW() WHERE id = $1", [taskId]);
        console.log(`[Task Worker] Task ${taskId} planning complete, now awaiting approval.`);
        break;
      case "execute_task":
        await new Promise((resolve) => setTimeout(resolve, 4000)); // Simulate execution
        await query(
          `UPDATE forge.tasks SET status = 'completed', completed_at = NOW(), updated_at = NOW(), build_status = 'success', files_modified = $1 WHERE id = $2`,
          [["src/components/Header.tsx", "src/lib/auth.ts"], taskId]
        );
        console.log(`[Task Worker] Task ${taskId} execution complete.`);
        break;
    }
  } catch (error) {
    console.error(`[Task Worker] Error processing job for task ID: ${taskId}`, error);
    await query("UPDATE forge.tasks SET status = 'failed', completed_at = NOW(), updated_at = NOW() WHERE id = $1", [taskId]);
  }
}

// ─── Project Scan Queue ───────────────────────────────────────────────────────

interface ProjectScanJobData { projectId: number; taskId: number; }

export const projectScanQueue = {
  async add(data: ProjectScanJobData) {
    console.log(`[Scan Queue] Adding scan for project ID: ${data.projectId}`);
    await processProjectScan(data);
  }
};

async function processProjectScan(data: ProjectScanJobData) {
  const { projectId, taskId } = data;
  console.log(`[Scan Worker] Processing scan for project ID: ${projectId}`);
  try {
    await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate scan
    await query("UPDATE forge.projects SET status = 'active', last_scan_at = NOW() WHERE id = $1", [projectId]);
    await query(
      `UPDATE forge.tasks SET status = 'completed', completed_at = NOW(), updated_at = NOW(), build_status = 'success', confidence_score = 95 WHERE id = $1`,
      [taskId]
    );
    console.log(`[Scan Worker] Scan complete for project ID: ${projectId}`);
  } catch (error) {
    console.error(`[Scan Worker] Error processing scan for project ID: ${projectId}`, error);
    await query("UPDATE forge.projects SET status = 'active' WHERE id = $1", [projectId]);
    await query("UPDATE forge.tasks SET status = 'failed', completed_at = NOW(), updated_at = NOW() WHERE id = $1", [taskId]);
  }
}

console.log("🐂 In-memory queue workers initialized (SQL-based storage).");
