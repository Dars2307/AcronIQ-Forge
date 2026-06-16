import { Router } from "express";
import { db } from "@workspace/db";
import { conversationsTable, messagesTable, projectsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";

const router = Router();

const aiReplies = [
  "I've analysed the codebase and identified 3 TypeScript errors in the authentication module. I recommend fixing the type mismatches in `src/lib/auth.ts` first, as they cascade into downstream components. Shall I create a task to address these?",
  "Based on my analysis, the main bottleneck is in the database query layer. The N+1 query pattern in `UserService` is causing significant latency. I can refactor this to use batch queries and reduce database round-trips by ~80%.",
  "I've detected a potential security vulnerability in the session handling code. The session tokens aren't being properly invalidated on logout. This is a high-severity issue — I recommend addressing it immediately. Want me to generate a fix?",
  "The build is failing due to a circular dependency between `src/services/auth.ts` and `src/middleware/validate.ts`. I can resolve this by extracting the shared types into a separate module. Should I proceed?",
  "I've completed the dependency audit. 12 packages have available updates, 3 of which have security patches. I recommend updating `express`, `jsonwebtoken`, and `pg` as a priority. Want me to create a task for the upgrades?",
];

router.get("/", async (_req, res) => {
  const conversations = await db.select().from(conversationsTable).orderBy(conversationsTable.createdAt);
  const projects = await db.select().from(projectsTable);
  const projectMap = Object.fromEntries(projects.map(p => [p.id, p.name]));

  const withCounts = await Promise.all(conversations.map(async c => {
    const msgs = await db.select({ count: count() }).from(messagesTable).where(eq(messagesTable.conversationId, c.id));
    return {
      ...c,
      projectName: c.projectId ? (projectMap[c.projectId] ?? null) : null,
      messageCount: msgs[0]?.count ?? 0,
      createdAt: c.createdAt.toISOString(),
    };
  }));

  res.json(withCounts);
});

router.post("/", async (req, res) => {
  const { title, projectId } = req.body;
  const [conv] = await db.insert(conversationsTable).values({
    title: String(title),
    projectId: projectId ? Number(projectId) : null,
  }).returning();

  const project = conv.projectId
    ? await db.select().from(projectsTable).where(eq(projectsTable.id, conv.projectId)).then(r => r[0])
    : null;

  res.status(201).json({
    ...conv,
    projectName: project?.name ?? null,
    messageCount: 0,
    createdAt: conv.createdAt.toISOString(),
  });
});

router.get("/:id/messages", async (req, res) => {
  const id = Number(req.params.id);
  const messages = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, id)).orderBy(messagesTable.createdAt);
  res.json(messages.map(m => ({ ...m, createdAt: m.createdAt.toISOString() })));
});

router.post("/:id/messages", async (req, res) => {
  const id = Number(req.params.id);
  const { content } = req.body;

  await db.insert(messagesTable).values({
    conversationId: id,
    role: "user",
    content: String(content),
  });

  const aiReply = aiReplies[Math.floor(Math.random() * aiReplies.length)];
  const [assistantMsg] = await db.insert(messagesTable).values({
    conversationId: id,
    role: "assistant",
    content: aiReply,
  }).returning();

  res.status(201).json({ ...assistantMsg, createdAt: assistantMsg.createdAt.toISOString() });
});

export default router;
