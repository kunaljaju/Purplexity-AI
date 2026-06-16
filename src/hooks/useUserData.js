import { useState, useEffect } from "react";
import { 
  syncSessionToServer, 
  deleteSessionFromServer, 
  syncBookmarkToServer, 
  deleteBookmarkFromServer, 
  fetchUserDataFromServer 
} from "../services/api";

export const useUserData = (authUser, authToken, isAuthLoading) => {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);

  // Fetch all user data from PostgreSQL database
  const loadUserDataFromServer = async (token) => {
    try {
      const { sessions: fetchedSessions, bookmarks: fetchedBookmarks } = await fetchUserDataFromServer(token);
      if (fetchedSessions && Array.isArray(fetchedSessions) && fetchedSessions.length > 0) {
        setSessions(fetchedSessions);
        setActiveSessionId(prev => {
          if (!prev) return fetchedSessions[0].id;
          return fetchedSessions.some(s => s.id === prev) ? prev : fetchedSessions[0].id;
        });
      }
      if (fetchedBookmarks && Array.isArray(fetchedBookmarks)) {
        setBookmarks(fetchedBookmarks);
      }
    } catch (err) {
      console.warn("PostgreSQL server database offline or not configured. Falling back to local cache.", err);
    }
  };

  // Load user-specific chat history & bookmarks once auth has finished checking
  useEffect(() => {
    if (isAuthLoading) return;

    const userId = authUser ? authUser.id : "guest";

    // Load sessions
    let saved = localStorage.getItem(`purplexity_chat_sessions_${userId}`);
    if (!saved && userId === "guest") {
      // Backwards compatibility fallback to legacy global key for guests
      saved = localStorage.getItem("purplexity_chat_sessions");
    }

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
        if (parsed.length > 0) {
          setActiveSessionId(prev => (parsed.some((s) => s.id === prev) ? prev : parsed[0].id));
        } else {
          setActiveSessionId(null);
        }
      } catch (e) {
        console.error("Failed to parse saved chat sessions:", e);
        setSessions([]);
        setActiveSessionId(null);
      }
    } else {
      setSessions([]);
      setActiveSessionId(null);
    }

    // Load bookmarks
    let savedBookmarks = localStorage.getItem(`purplexity_bookmarks_${userId}`);
    if (!savedBookmarks && userId === "guest") {
      // Backwards compatibility fallback to legacy global key for guests
      savedBookmarks = localStorage.getItem("purplexity_bookmarks");
    }

    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks));
      } catch (e) {
        console.error("Failed to parse saved bookmarks:", e);
        setBookmarks([]);
      }
    } else {
      setBookmarks([]);
    }

    // Load from backend server database if authenticated
    if (authToken) {
      loadUserDataFromServer(authToken);
    }
  }, [authUser?.id, isAuthLoading, authToken]);

  const saveSessions = (updatedSessions) => {
    setSessions(updatedSessions);
    const userId = authUser ? authUser.id : "guest";
    localStorage.setItem(`purplexity_chat_sessions_${userId}`, JSON.stringify(updatedSessions));
    
    if (authToken) {
      const activeSess = updatedSessions.find(s => s.id === activeSessionId) || updatedSessions[0];
      if (activeSess) {
        syncSessionToServer(activeSess, authToken);
      }
    }
  };

  const saveBookmarks = (updatedBookmarks) => {
    const previousBookmarks = bookmarks;
    setBookmarks(updatedBookmarks);
    const userId = authUser ? authUser.id : "guest";
    localStorage.setItem(`purplexity_bookmarks_${userId}`, JSON.stringify(updatedBookmarks));

    if (authToken) {
      const added = updatedBookmarks.filter(b => !previousBookmarks.some(pb => pb.id === b.id));
      added.forEach(b => syncBookmarkToServer(b, authToken));

      const removed = previousBookmarks.filter(pb => !updatedBookmarks.some(b => b.id === pb.id));
      removed.forEach(pb => deleteBookmarkFromServer(pb.id, authToken));
    }
  };

  const handleToggleBookmark = (messageId, sessionId) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    const messageIndex = session.messages.findIndex((m) => m.id === messageId);
    if (messageIndex === -1) return;

    const message = session.messages[messageIndex];
    if (message.role !== "assistant") return;

    // Retrieve preceding inquiry
    let queryText = "Grounded Search Inquiry";
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (session.messages[i].role === "user") {
        queryText = session.messages[i].content;
        break;
      }
    }

    const isBookmarked = bookmarks.some((b) => b.id === messageId);
    if (isBookmarked) {
      const updated = bookmarks.filter((b) => b.id !== messageId);
      saveBookmarks(updated);
    } else {
      const newBookmark = {
        id: messageId,
        sessionId: sessionId,
        sessionTitle: session.title,
        queryText: queryText,
        content: message.content,
        citations: message.citations || [],
        searchQueries: message.searchQueries || [],
        modeUsed: message.modeUsed || "standard",
        timestamp: message.timestamp,
        bookmarkedAt: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      saveBookmarks([...bookmarks, newBookmark]);
    }
  };

  const handleDeleteSession = (id, e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    const updated = sessions.filter((s) => s.id !== id);
    saveSessions(updated);
    if (activeSessionId === id) {
      if (updated.length > 0) {
        setActiveSessionId(updated[0].id);
      } else {
        setActiveSessionId(null);
      }
    }
    if (authToken) {
      deleteSessionFromServer(id, authToken);
    }
  };

  const handleClearHistory = () => {
    if (authToken) {
      sessions.forEach(s => deleteSessionFromServer(s.id, authToken));
    }
    saveSessions([]);
    setActiveSessionId(null);
  };

  return {
    sessions,
    setSessions,
    activeSessionId,
    setActiveSessionId,
    bookmarks,
    setBookmarks,
    saveSessions,
    saveBookmarks,
    handleToggleBookmark,
    handleDeleteSession,
    handleClearHistory,
    loadUserDataFromServer
  };
};
