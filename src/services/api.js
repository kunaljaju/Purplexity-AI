// Sync session to PostgreSQL database
export const syncSessionToServer = async (sess, token) => {
  try {
    await fetch("/api/me/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(sess),
    });
  } catch (err) {
    console.warn("Skipped syncing session to PostgreSQL database:", err);
  }
};

// Delete session from PostgreSQL database
export const deleteSessionFromServer = async (sessId, token) => {
  try {
    await fetch(`/api/me/sessions/${sessId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    console.warn("Skipped deleting session from PostgreSQL database:", err);
  }
};

// Sync bookmark to PostgreSQL database
export const syncBookmarkToServer = async (b, token) => {
  try {
    await fetch("/api/me/bookmarks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(b),
    });
  } catch (err) {
    console.warn("Skipped syncing bookmark to PostgreSQL database:", err);
  }
};

// Delete bookmark from PostgreSQL database
export const deleteBookmarkFromServer = async (bId, token) => {
  try {
    await fetch(`/api/me/bookmarks/${bId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    console.warn("Skipped deleting bookmark from PostgreSQL database:", err);
  }
};

// Fetch user data (sessions & bookmarks) from database
export const fetchUserDataFromServer = async (token) => {
  const sessionsRes = await fetch("/api/me/sessions", {
    headers: { Authorization: `Bearer ${token}` },
  });
  let sessions = [];
  if (sessionsRes.ok) {
    const data = await sessionsRes.json();
    if (data && Array.isArray(data)) {
      sessions = data;
    }
  }

  const bookmarksRes = await fetch("/api/me/bookmarks", {
    headers: { Authorization: `Bearer ${token}` },
  });
  let bookmarks = [];
  if (bookmarksRes.ok) {
    const bData = await bookmarksRes.json();
    if (bData && Array.isArray(bData)) {
      bookmarks = bData;
    }
  }

  return { sessions, bookmarks };
};

// Perform AI search synthesis request
export const executeSearch = async (userPrompt, history, currentMode, selectedModel) => {
  const response = await fetch("/api/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: userPrompt,
      history: history.map(m => ({ role: m.role, content: m.content })),
      mode: currentMode,
      model: selectedModel,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Synthesis request failed.");
  }

  return await response.json();
};
