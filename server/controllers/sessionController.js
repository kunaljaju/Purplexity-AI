import { getPrisma, isDatabaseConfigured } from "../db.js";

// Resilient in-memory backup repository for chat sessions
const inMemorySessions = new Map();

export async function getUserSessions(req, res) {
  if (!isDatabaseConfigured()) {
    const list = inMemorySessions.get(req.user.id) || [];
    return res.json(list);
  }

  try {
    const prisma = getPrisma();
    const sessions = await prisma.chatSession.findMany({
      where: { userId: req.user.id },
      include: { messages: true },
      orderBy: { createdAt: "desc" },
    });
    
    const formatted = sessions.map((sess) => ({
      id: sess.id,
      title: sess.title,
      mode: sess.mode,
      createdAt: sess.createdAt.toISOString(),
      messages: sess.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
        modeUsed: m.modeUsed,
        searchQueries: m.searchQueries ? JSON.parse(JSON.stringify(m.searchQueries)) : undefined,
        citations: m.citations ? JSON.parse(JSON.stringify(m.citations)) : undefined,
        followUps: m.followUps ? JSON.parse(JSON.stringify(m.followUps)) : undefined,
        searchSteps: m.searchSteps ? JSON.parse(JSON.stringify(m.searchSteps)) : undefined,
      })).sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
    }));

    return res.json(formatted);
  } catch (err) {
    console.warn("Database reading error during getUserSessions, falling back to cache:", err.message);
    const list = inMemorySessions.get(req.user.id) || [];
    return res.json(list);
  }
}

export async function upsertUserSession(req, res) {
  const { id, title, mode, messages } = req.body;
  if (!id || !title || !mode) {
    return res.status(400).json({ error: "Session fields (id, title, mode) are required." });
  }

  // Deep clone and structural format for messages to keep consistency in front-end mapping
  const mappedMessages = (messages || []).map((m) => ({
    id: m.id || `msg_${Date.now()}_${Math.random()}`,
    role: m.role,
    content: m.content,
    timestamp: m.timestamp || new Date().toISOString(),
    modeUsed: m.modeUsed,
    searchQueries: m.searchQueries || undefined,
    citations: m.citations || undefined,
    followUps: m.followUps || undefined,
    searchSteps: m.searchSteps || undefined,
  })).sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  const sessionPayload = {
    id,
    title,
    mode,
    createdAt: new Date().toISOString(),
    messages: mappedMessages,
  };

  if (!isDatabaseConfigured()) {
    const list = inMemorySessions.get(req.user.id) || [];
    const index = list.findIndex(s => s.id === id);
    if (index >= 0) {
      sessionPayload.createdAt = list[index].createdAt; // preserve initial timestamp
      list[index] = sessionPayload;
    } else {
      list.push(sessionPayload);
    }
    list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    inMemorySessions.set(req.user.id, list);
    return res.json({ success: true, sessionId: id });
  }

  try {
    const prisma = getPrisma();

    // Upsert the chat session
    await prisma.chatSession.upsert({
      where: { id },
      update: { title, mode },
      create: {
        id,
        userId: req.user.id,
        title,
        mode,
      },
    });

    // Delete existing messages inside this session to prevent constraints mismatch on rewrite
    await prisma.message.deleteMany({
      where: { sessionId: id },
    });

    // Create incoming messages in sequence or in bulk
    if (messages && Array.isArray(messages)) {
      for (const m of messages) {
        await prisma.message.create({
          data: {
            id: m.id,
            sessionId: id,
            role: m.role,
            content: m.content,
            timestamp: m.timestamp || new Date().toISOString(),
            modeUsed: m.modeUsed,
            searchQueries: m.searchQueries || null,
            citations: m.citations || null,
            followUps: m.followUps || null,
            searchSteps: m.searchSteps || null,
          },
        });
      }
    }

    return res.json({ success: true, sessionId: id });
  } catch (err) {
    console.warn("Database saving error in upsertUserSession, saving in cache:", err.message);
    const list = inMemorySessions.get(req.user.id) || [];
    const index = list.findIndex(s => s.id === id);
    if (index >= 0) {
      sessionPayload.createdAt = list[index].createdAt;
      list[index] = sessionPayload;
    } else {
      list.push(sessionPayload);
    }
    list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    inMemorySessions.set(req.user.id, list);
    return res.json({ success: true, sessionId: id });
  }
}

export async function deleteUserSession(req, res) {
  const { id } = req.params;

  if (!isDatabaseConfigured()) {
    const list = inMemorySessions.get(req.user.id) || [];
    const filtered = list.filter(s => s.id !== id);
    inMemorySessions.set(req.user.id, filtered);
    return res.json({ success: true });
  }

  try {
    const prisma = getPrisma();
    await prisma.chatSession.delete({
      where: { id, userId: req.user.id },
    });
    return res.json({ success: true });
  } catch (err) {
    console.warn("Database deletion error in deleteUserSession, deleting in cache:", err.message);
    const list = inMemorySessions.get(req.user.id) || [];
    const filtered = list.filter(s => s.id !== id);
    inMemorySessions.set(req.user.id, filtered);
    return res.json({ success: true });
  }
}
