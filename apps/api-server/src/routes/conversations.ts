import { Router } from "express";
import { query } from "../lib/db";

const router = Router();

const aiReplies = [
  "I've analysed the codebase and identified 3 TypeScript errors in the authentication module. I recommend fixing the type mismatches in `src/lib/auth.ts` first, as they cascade into downstream components. Shall I create a task to address these?",
  "Based on my analysis, the main bottleneck is in the database query layer. The N+1 query pattern in `UserService` is causing significant latency. I can refactor this to use batch queries and reduce database round-trips by ~80%.",
  "I've detected a potential security vulnerability in the session handling code. The session tokens aren't being properly invalidated on logout. This is a high-severity issue — I recommend addressing it immediately. Want me to generate a fix?",
  "The build is failing due to a circular dependency between `src/services/auth.ts` and `src/middleware/validate.ts`. I can resolve this by extracting the shared types into a separate module. Should I proceed?",
  "I've completed the dependency audit. 12 packages have available updates, 3 of which have security patches. I recommend updating `express`, `jsonwebtoken`, and `pg` as a priority. Want me to create a task for the upgrades?",
];

router.get("/", async (_req, res) => {
  const convResult = await query("SELECT * FROM forge.conversations ORDER BY created_at DESC");
  const conversations = convResult.rows;

  const projectResult = await query("SELECT id, name FROM forge.projects");
  const projects = projectResult.rows;
  const projectMap = Object.fromEntries(projects.map((p: any) => [p.id, p.name]));

  const messageCountResult = await query(
    "SELECT conversation_id, COUNT(*) as count FROM forge.messages GROUP BY conversation_id"
  );
  const countMap = Object.fromEntries(messageCountResult.rows.map((mc: any) => [mc.conversation_id, mc.count]));

  const response = conversations.map((c: any) => ({
    ...c,
    projectName: c.project_id ? (projectMap[c.project_id] ?? null) : null,
    messageCount: countMap[c.id] ?? 0,
    createdAt: c.created_at?.toISOString() ?? null,
  }));

  res.json(response);
});

router.post("/", async (req, res) => {
  const { title, projectId } = req.body;
  const convResult = await query(
    `INSERT INTO forge.conversations (title, project_id, created_at)
     VALUES ($1, $2, NOW())
     RETURNING *`,
    [String(title), projectId ? Number(projectId) : null]
  );

  const conv = convResult.rows[0];

  const project = conv.project_id
    ? (await query("SELECT name FROM forge.projects WHERE id = $1", [conv.project_id])).rows[0]
    : null;

  res.status(201).json({
    ...conv,
    projectName: project?.name ?? null,
    messageCount: 0,
    createdAt: conv.created_at?.toISOString() ?? null,
  });
});

router.get("/:id/messages", async (req, res) => {
  const id = Number(req.params.id);
  const result = await query("SELECT * FROM forge.messages WHERE conversation_id = $1 ORDER BY created_at ASC", [id]);
  res.json(result.rows.map((m: any) => ({ ...m, createdAt: m.created_at?.toISOString() ?? null })));
});

router.post("/:id/messages", async (req, res) => {
  const id = Number(req.params.id);
  const { content } = req.body;

  await query(
    `INSERT INTO forge.messages (conversation_id, role, content, created_at)
     VALUES ($1, $2, $3, NOW())`,
    [id, "user", String(content)]
  );

  const aiReply = aiReplies[Math.floor(Math.random() * aiReplies.length)];
  const assistantMsgResult = await query(
    `INSERT INTO forge.messages (conversation_id, role, content, created_at)
     VALUES ($1, $2, $3, NOW())
     RETURNING *`,
    [id, "assistant", aiReply]
  );

  const assistantMsg = assistantMsgResult.rows[0];
  res.status(201).json({ ...assistantMsg, createdAt: assistantMsg.created_at?.toISOString() ?? null });
});

export default router;
