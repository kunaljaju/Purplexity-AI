import { getPrisma, isDatabaseConfigured } from "../db.js";

// Resilient in-memory backup repository for bookmarks
const inMemoryBookmarks = new Map();

export async function getUserBookmarks(req, res) {
  // If database credentials are not ready, load from transient cache safely
  if (!isDatabaseConfigured()) {
    const list = inMemoryBookmarks.get(req.user.id) || [];
    return res.json(list);
  }

  try {
    const prisma = getPrisma();
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    const formatted = bookmarks.map((b) => ({
      id: b.id,
      sessionId: b.sessionId,
      sessionTitle: b.sessionTitle,
      queryText: b.queryText,
      content: b.content,
      bookmarkedAt: b.bookmarkedAt,
      timestamp: b.timestamp,
      modeUsed: b.modeUsed,
      citations: b.citations ? JSON.parse(JSON.stringify(b.citations)) : undefined,
      searchQueries: b.searchQueries ? JSON.parse(JSON.stringify(b.searchQueries)) : undefined,
    }));

    return res.json(formatted);
  } catch (err) {
    console.warn("Database reading error during getUserBookmarks, falling back to cache:", err.message);
    const list = inMemoryBookmarks.get(req.user.id) || [];
    return res.json(list);
  }
}

export async function upsertUserBookmark(req, res) {
  const { id, sessionId, sessionTitle, queryText, content, citations, searchQueries, modeUsed, timestamp, bookmarkedAt } = req.body;
  if (!id || !sessionId || !queryText || !content) {
    return res.status(400).json({ error: "Required fields (id, sessionId, queryText, content) are missing." });
  }

  const payload = {
    id,
    sessionId,
    sessionTitle,
    queryText,
    content,
    citations,
    searchQueries,
    modeUsed,
    timestamp: timestamp || new Date().toISOString(),
    bookmarkedAt: bookmarkedAt || new Date().toISOString(),
  };

  // If database credentials are not ready, save to cache safely
  if (!isDatabaseConfigured()) {
    const list = inMemoryBookmarks.get(req.user.id) || [];
    const index = list.findIndex(b => b.id === id);
    if (index >= 0) {
      list[index] = { ...list[index], ...payload };
    } else {
      list.push(payload);
    }
    inMemoryBookmarks.set(req.user.id, list);
    return res.json({ success: true, bookmarkId: id });
  }

  try {
    const prisma = getPrisma();
    const bookmark = await prisma.bookmark.upsert({
      where: { id },
      update: {
        sessionTitle,
        queryText,
        content,
        citations: citations || null,
        searchQueries: searchQueries || null,
        modeUsed,
        timestamp,
        bookmarkedAt,
      },
      create: {
        id,
        userId: req.user.id,
        sessionId,
        sessionTitle,
        queryText,
        content,
        citations: citations || null,
        searchQueries: searchQueries || null,
        modeUsed,
        timestamp,
        bookmarkedAt,
      },
    });

    return res.json({ success: true, bookmarkId: bookmark.id });
  } catch (err) {
    console.warn("Database saving error during upsertUserBookmark, saving in cache:", err.message);
    const list = inMemoryBookmarks.get(req.user.id) || [];
    const index = list.findIndex(b => b.id === id);
    if (index >= 0) {
      list[index] = { ...list[index], ...payload };
    } else {
      list.push(payload);
    }
    inMemoryBookmarks.set(req.user.id, list);
    return res.json({ success: true, bookmarkId: id });
  }
}

export async function deleteUserBookmark(req, res) {
  const { id } = req.params;

  if (!isDatabaseConfigured()) {
    const list = inMemoryBookmarks.get(req.user.id) || [];
    const filtered = list.filter(b => b.id !== id);
    inMemoryBookmarks.set(req.user.id, filtered);
    return res.json({ success: true });
  }

  try {
    const prisma = getPrisma();
    await prisma.bookmark.delete({
      where: { id, userId: req.user.id },
    });
    return res.json({ success: true });
  } catch (err) {
    console.warn("Database deletion error in deleteUserBookmark, removing from cache:", err.message);
    const list = inMemoryBookmarks.get(req.user.id) || [];
    const filtered = list.filter(b => b.id !== id);
    inMemoryBookmarks.set(req.user.id, filtered);
    return res.json({ success: true });
  }
}
