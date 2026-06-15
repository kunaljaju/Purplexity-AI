import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  Sparkles, 
  BookOpen, 
  PenTool, 
  Compass, 
  Plus, 
  Trash2, 
  Globe, 
  Link as LinkIcon, 
  ArrowUp, 
  ExternalLink, 
  Cpu, 
  Layers, 
  Check, 
  Loader2, 
  History, 
  User, 
  ChevronRight,
  ChevronLeft,
  Menu,
  RefreshCw,
  Info,
  Star,
  Copy,
  Calendar,
  TrendingUp,
  X,
  Bookmark as BookmarkIcon,
  LogOut,
  Sun,
  Moon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AuthPage } from "./components/AuthPage";
import { Sidebar } from "./components/Sidebar";
import { LandingSearchPanel } from "./components/LandingSearchPanel";
import { DashboardView } from "./components/DashboardView";
import { ChatResultPanel } from "./components/ChatResultPanel";

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState("google/gemini-2.5-flash");
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("purplexity_theme") !== "light");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem("purplexity_sidebar_collapsed") === "true");
  const [activeMode, setActiveMode] = useState("standard");
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchSteps, setSearchSteps] = useState([]);
  const [searchPercentage, setSearchPercentage] = useState(0);
  const [errorStatus, setErrorStatus] = useState(null);

  // User bookmarks & dashboard visual view states
  const [bookmarks, setBookmarks] = useState([]);
  const [viewMode, setViewMode] = useState("search");
  const [dashboardSearchQuery, setDashboardSearchQuery] = useState("");
  const [dashboardFilterMode, setDashboardFilterMode] = useState("all");
  const [copiedBookmarkId, setCopiedBookmarkId] = useState(null);

  // Authentication State
  const [authUser, setAuthUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const messagesEndRef = useRef(null);
  const searchInputRef = useRef(null);

  // Sync session to server Helper
  const syncSessionToServer = async (sess, token) => {
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

  // Delete session from server Helper
  const deleteSessionFromServer = async (sessId, token) => {
    try {
      await fetch(`/api/me/sessions/${sessId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.warn("Skipped deleting session from PostgreSQL database:", err);
    }
  };

  // Sync bookmark to server Helper
  const syncBookmarkToServer = async (b, token) => {
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

  // Delete bookmark from server Helper
  const deleteBookmarkFromServer = async (bId, token) => {
    try {
      await fetch(`/api/me/bookmarks/${bId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.warn("Skipped deleting bookmark from PostgreSQL database:", err);
    }
  };

  // Fetch all user data from PostgreSQL database
  const loadUserDataFromServer = async (token) => {
    try {
      const sessionsRes = await fetch("/api/me/sessions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (sessionsRes.ok) {
        const data = await sessionsRes.json();
        if (data && Array.isArray(data) && data.length > 0) {
          setSessions(data);
          if (!activeSessionId) {
            setActiveSessionId(data[0].id);
          }
        }
      }

      const bookmarksRes = await fetch("/api/me/bookmarks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (bookmarksRes.ok) {
        const bData = await bookmarksRes.json();
        if (bData && Array.isArray(bData)) {
          setBookmarks(bData);
        }
      }
    } catch (err) {
      console.warn("PostgreSQL server database offline or not configured. Falling back to local cache.", err);
    }
  };

  // Handle successful login
  const handleAuthSuccess = (user, session) => {
    setAuthUser(user);
    const token = session?.access_token || null;
    setAuthToken(token);
    
    if (user) {
      localStorage.setItem("purplexity_user", JSON.stringify(user));
    }
    if (token) {
      localStorage.setItem("purplexity_token", token);
    }
    
    if (token) {
      loadUserDataFromServer(token);
    }
  };

  const handleSignOut = async () => {
    localStorage.removeItem("purplexity_user");
    localStorage.removeItem("purplexity_token");
    setAuthUser(null);
    setAuthToken(null);
    setSessions([]);
    setBookmarks([]);
    setActiveSessionId(null);
  };

  // 1. Initialize authentication on mount
  useEffect(() => {
    // Load persisted account login state
    const savedUser = localStorage.getItem("purplexity_user");
    const savedToken = localStorage.getItem("purplexity_token");
    if (savedUser && savedToken) {
      try {
        const user = JSON.parse(savedUser);
        setAuthUser(user);
        setAuthToken(savedToken);
      } catch (e) {
        console.error("Local token recovery failed:", e);
      }
    }
    setIsAuthLoading(false);
  }, []);

  // 2. Load user-specific chat history & bookmarks once auth has finished checking
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

  // Keyboard shortcut listener to toggle sidebar and start a new thread
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle sidebar shortcut: Ctrl+B or Cmd+B
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setIsSidebarCollapsed(prev => {
          const newVal = !prev;
          localStorage.setItem("purplexity_sidebar_collapsed", newVal ? "true" : "false");
          return newVal;
        });
      }
      // New search thread: Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setViewMode("search");
        handleNewSearch();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Sync to local and backend DB
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

  const handleCopyClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedBookmarkId(id);
    setTimeout(() => {
      setCopiedBookmarkId(null);
    }, 2000);
  };

  // Scroll to bottom of message thread
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions, activeSessionId, searchSteps, isSearching]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  // Start a new search thread
  const handleNewSearch = () => {
    setActiveSessionId(null);
    setQuery("");
    setErrorStatus(null);
    setSearchSteps([]);
    setViewMode("search");
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  // Delete a specific session
  const handleDeleteSession = (id, e) => {
    e.stopPropagation();
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

  // Clear entire search history
  const handleClearHistory = () => {
    if (authToken) {
      sessions.forEach(s => deleteSessionFromServer(s.id, authToken));
    }
    saveSessions([]);
    setActiveSessionId(null);
    handleNewSearch();
  };


  // Run the web grounding search flow
  const runSearch = async (userPrompt, overrideMode) => {
    if (!userPrompt.trim() || isSearching) return;

    const currentMode = overrideMode || activeMode;

    setErrorStatus(null);
    setIsSearching(true);
    setSearchSteps(["Formulating context...", "Initiating neural router..."]);
    setSearchPercentage(15);

    // Initial state simulation steps for dynamic search feel
    const stepIntervals = [];
    const pushStep = (stepText, percentage, delay) => {
      const id = setTimeout(() => {
        setSearchSteps((prev) => [...prev, stepText]);
        setSearchPercentage(percentage);
      }, delay);
      stepIntervals.push(id);
    };

    if (currentMode !== "writing") {
      pushStep(`Analysing search term matches for "${userPrompt.slice(0, 30)}"...`, 35, 800);
      pushStep("Triggering Google Search Index & crawler grounding...", 60, 1500);
      pushStep("Retrieving top organic source citation nodes...", 80, 2200);
      pushStep("De-duplicating knowledge chunks and synthesizing markdown answer...", 95, 3000);
    } else {
      pushStep("Synthesizing creative layout grids...", 45, 800);
      pushStep("Formulating detailed technical and structural response...", 85, 1800);
    }

    try {
      // Build session context (include past messages in current thread context)
      const currentHistory = activeSession ? activeSession.messages : [];

      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: userPrompt,
          history: currentHistory.map(m => ({ role: m.role, content: m.content })),
          mode: currentMode,
          model: selectedModel,
        }),
      });

      // Clear search intervals
      stepIntervals.forEach(clearTimeout);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Synthesis request failed.");
      }

      const data = await response.json();

      const userMessage = {
        id: "usr_" + Date.now(),
        role: "user",
        content: userPrompt,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const aiMessage = {
        id: "ai_" + (Date.now() + 1),
        role: "assistant",
        content: data.answer,
        searchQueries: currentMode !== "writing" ? data.searchQueries : [],
        citations: currentMode !== "writing" ? data.citations : [],
        followUps: data.followUps || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modeUsed: currentMode,
      };

      if (!activeSessionId) {
        // Create brand new chat session
        const newSessionId = "sess_" + Date.now();
        const newSession = {
          id: newSessionId,
          title: userPrompt.length > 35 ? userPrompt.slice(0, 35) + "..." : userPrompt,
          messages: [userMessage, aiMessage],
          createdAt: new Date().toLocaleDateString(),
          mode: currentMode,
        };
        saveSessions([newSession, ...sessions]);
        setActiveSessionId(newSessionId);
      } else {
        // Append to existing active session
        const updated = sessions.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: [...s.messages, userMessage, aiMessage],
            };
          }
          return s;
        });
        saveSessions(updated);
      }

      setQuery("");
    } catch (err) {
      console.error(err);
      setErrorStatus(err.message || "Something went wrong. Please check your server or API configuration.");
    } finally {
      setIsSearching(false);
      setSearchSteps([]);
      setSearchPercentage(0);
      stepIntervals.forEach(clearTimeout);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      runSearch(query);
    }
  };

  // Helper function to render formatted answer custom markdown with proper layout, highlights, citations links, and interactive tables
  const renderFormattedAnswer = (text, citations = []) => {
    const cleanedText = text.replace(/\[\d+(?:\s*,\s*\d+)*\]/g, "");
    const lines = cleanedText.split("\n");
    const elements = [];
    
    let currentTableRows = [];
    let isTableActive = false;
    let hasTableSeparator = false;

    const flushTable = (key) => {
      if (currentTableRows.length === 0) return;
      
      let headers = [];
      let bodyRows = [];

      if (hasTableSeparator && currentTableRows.length > 1) {
        headers = currentTableRows[0];
        bodyRows = currentTableRows.slice(2); // Skip description/alignment dashed row (index 1)
      } else {
        headers = currentTableRows[0];
        bodyRows = currentTableRows.slice(1);
      }

      elements.push(
        <FormattedTable
          key={`table-${key}`}
          headers={headers}
          rows={bodyRows}
          isDarkMode={isDarkMode}
          renderInline={(txt) => parseInlineStyles(txt, citations)}
        />
      );

      currentTableRows = [];
      isTableActive = false;
      hasTableSeparator = false;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Detect typical Markdown table row lines
      const isTableRow = trimmed.startsWith("|") && trimmed.includes("|", 1);

      if (isTableRow) {
        isTableActive = true;
        let cells = trimmed.split("|").map(c => c.trim());
        // Remove empty first/last array elements from outer border lines
        if (trimmed.startsWith("|") && cells[0] === "") cells.shift();
        if (trimmed.endsWith("|") && cells[cells.length - 1] === "") cells.pop();

        // Check if row is alignment/separator row
        const isSep = cells.every(c => /^:?-+:?$/.test(c));
        if (isSep) {
          hasTableSeparator = true;
        }
        currentTableRows.push(cells);
      } else {
        if (isTableActive) {
          flushTable(i);
        }

        // Process standard inline elements
        if (trimmed.startsWith("###")) {
          const hText = trimmed.replace(/^###\s*/, "");
          elements.push(
            <h3 key={i} className={`text-lg font-display font-semibold mt-5 mb-2 flex items-center gap-2 ${
              isDarkMode === false ? "text-zinc-900 font-bold" : "text-purple-200"
            }`}>
              <span className="w-1 px-0.5 h-4 bg-purple-500 rounded-full inline-block"></span>
              {parseInlineStyles(hText, citations)}
            </h3>
          );
        } else if (trimmed.startsWith("##")) {
          const hText = trimmed.replace(/^##\s*/, "");
          elements.push(
            <h2 key={i} className={`text-xl font-display font-semibold mt-6 mb-3 border-b pb-1 ${
              isDarkMode === false ? "text-zinc-900 border-zinc-200 font-bold" : "text-purple-100 border-purple-950/40"
            }`}>
              {parseInlineStyles(hText, citations)}
            </h2>
          );
        } else if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
          const listText = trimmed.replace(/^[-*]\s*/, "");
          elements.push(
            <li key={i} className={`ml-5 list-disc text-sm leading-relaxed my-1.5 pl-1 decoration-purple-500/50 ${
              isDarkMode === false ? "text-zinc-800" : "text-gray-300"
            }`}>
              {parseInlineStyles(listText, citations)}
            </li>
          );
        } else if (/^\d+\.\s+/.test(trimmed)) {
          const numText = trimmed.replace(/^\d+\.\s*/, "");
          const numMatch = trimmed.match(/^(\d+)\.\s*/);
          const num = numMatch ? numMatch[1] : "1";
          elements.push(
            <div key={i} className={`ml-5 text-sm leading-relaxed my-1.5 flex gap-2 ${
              isDarkMode === false ? "text-zinc-800" : "text-gray-300"
            }`}>
              <span className={isDarkMode === false ? "text-purple-700 font-mono font-semibold" : "text-purple-400 font-mono font-medium"}>{num}.</span>
              <span className="flex-1">{parseInlineStyles(numText, citations)}</span>
            </div>
          );
        } else if (trimmed === "") {
          elements.push(<div key={i} className="h-2"></div>);
        } else {
          elements.push(
            <p key={i} className={`text-sm leading-relaxed my-2 text-justify ${
              isDarkMode === false ? "text-zinc-800" : "text-gray-300"
            }`}>
              {parseInlineStyles(trimmed, citations)}
            </p>
          );
        }
      }
    }

    if (isTableActive) {
      flushTable("end");
    }

    return elements;
  };

  // Helper to parse citations e.g. [1] or boldness **bold**
  const parseInlineStyles = (line, citations) => {
    // First, bold matching
    let parts = [
      { type: "text", val: line }
    ];

    // Pass 1: Parse bold text **bold**
    let finalParts = [];
    parts.forEach((p) => {
      if (p.type === "text") {
        const boldRegex = /\*\*([^*]+)\*\*/g;
        let lastIdx = 0;
        let match;
        while ((match = boldRegex.exec(p.val)) !== null) {
          if (match.index > lastIdx) {
            finalParts.push({ type: "text", val: p.val.slice(lastIdx, match.index) });
          }
          finalParts.push({ type: "bold", val: match[1] });
          lastIdx = boldRegex.lastIndex;
        }
        if (lastIdx < p.val.length) {
          finalParts.push({ type: "text", val: p.val.slice(lastIdx) });
        }
      } else {
        finalParts.push(p);
      }
    });
    parts = finalParts;

    // Pass 2: Parse inline code `code`
    finalParts = [];
    parts.forEach((p) => {
      if (p.type === "text") {
        const codeRegex = /`([^`]+)`/g;
        let lastIdx = 0;
        let match;
        while ((match = codeRegex.exec(p.val)) !== null) {
          if (match.index > lastIdx) {
            finalParts.push({ type: "text", val: p.val.slice(lastIdx, match.index) });
          }
          finalParts.push({ type: "code", val: match[1] });
          lastIdx = codeRegex.lastIndex;
        }
        if (lastIdx < p.val.length) {
          finalParts.push({ type: "text", val: p.val.slice(lastIdx) });
        }
      } else {
        finalParts.push(p);
      }
    });
    parts = finalParts;

    // Pass 3: Parse citation tags e.g. [1], [2] and turn them into hyperlinked superscript pills
    finalParts = [];
    parts.forEach((p) => {
      if (p.type === "text") {
        const citationRegex = /\[(\d+)\]/g;
        let lastIdx = 0;
        let match;
        while ((match = citationRegex.exec(p.val)) !== null) {
          if (match.index > lastIdx) {
            finalParts.push({ type: "text", val: p.val.slice(lastIdx, match.index) });
          }
          const citationId = parseInt(match[1]);
          const citationVal = citations.find(c => c.id === citationId);
          finalParts.push({ 
            type: "citation", 
            val: `[${citationId}]`,
            link: citationVal?.url || "#"
          });
          lastIdx = citationRegex.lastIndex;
        }
        if (lastIdx < p.val.length) {
          finalParts.push({ type: "text", val: p.val.slice(lastIdx) });
        }
      } else {
        finalParts.push(p);
      }
    });
    parts = finalParts;

    // Convert parsed structures into JSX elements
    return parts.map((part, index) => {
      if (part.type === "bold") {
        return <strong key={index} className={isDarkMode === false ? "text-purple-800 font-bold" : "text-purple-300 font-semibold"}>{part.val}</strong>;
      }
      if (part.type === "code") {
        return <code key={index} className={isDarkMode === false ? "px-1.5 py-0.5 rounded font-mono text-xs bg-purple-100 text-purple-800 border border-purple-200" : "px-1.5 py-0.5 rounded font-mono text-xs bg-purple-950/50 text-purple-300 border border-purple-800/20"}>{part.val}</code>;
      }
      if (part.type === "citation") {
        return (
          <a
            key={index}
            href={part.link}
            target="_blank"
            referrerPolicy="no-referrer"
            className={isDarkMode === false ? "inline-block mx-0.5 px-1 bg-purple-100/80 text-purple-700 hover:bg-purple-600 hover:text-white rounded text-[10px] font-mono leading-none transition-all" : "inline-block mx-0.5 px-1 bg-purple-900/40 text-purple-300 hover:bg-purple-600 hover:text-white rounded text-[10px] font-mono leading-none transition-all"}
            title={citations.find(c => c.url === part.link)?.title || "Click to visit citation source"}
          >
            {part.val}
          </a>
        );
      }
      return <React.Fragment key={index}>{part.val}</React.Fragment>;
    });
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#05040a] flex flex-col justify-center items-center text-white">
        <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
        <p className="text-xs text-zinc-500 mt-4 font-mono select-none">Checking secure auth session...</p>
      </div>
    );
  }

  if (!authUser) {
    return (
      <AuthPage 
        onAuthSuccess={handleAuthSuccess} 
      />
    );
  }

  return (
    <div className={`flex h-screen overflow-hidden font-sans antialiased transition-colors duration-250 ${
      isDarkMode === false 
        ? "bg-[#fafafa] text-zinc-800" 
        : "bg-[#05040a] text-zinc-105"
    }`}>
      
      {/* Dynamic Background Glowing Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none transition-all duration-300 ${
          isDarkMode === false ? "bg-purple-100/40" : "bg-purple-900/10"
        }`}></div>
        <div className={`absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none transition-all duration-300 ${
          isDarkMode === false ? "bg-indigo-100/30" : "bg-indigo-900/10"
        }`}></div>
      </div>

      {/* LEFT SIDEBAR - SESSIONS NAVIGATION & HISTORY */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        setActiveSessionId={setActiveSessionId}
        authUser={authUser}
        handleSignOut={handleSignOut}
        handleDeleteSession={handleDeleteSession}
        handleClearHistory={handleClearHistory}
        handleNewSearch={handleNewSearch}
        setViewMode={setViewMode}
        setErrorStatus={setErrorStatus}
        isDarkMode={isDarkMode}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={(val) => {
          setIsSidebarCollapsed(val);
          localStorage.setItem("purplexity_sidebar_collapsed", val ? "true" : "false");
        }}
      />

      {/* Mobile drawer backdrop overlay */}
      {!isSidebarCollapsed && (
        <div 
          id="mobile-sidebar-backdrop"
          className="fixed inset-0 bg-black/60 z-35 md:hidden transition-opacity duration-300 cursor-pointer"
          onClick={() => {
            setIsSidebarCollapsed(true);
            localStorage.setItem("purplexity_sidebar_collapsed", "true");
          }}
        />
      )}

      {/* CORE SEARCH VIEWER AREA */}
      <main className="flex-1 flex flex-col min-w-0 z-10 relative">
        
        {/* Floating Header Actions */}
        <header className={`h-16 flex items-center justify-between px-4 md:px-8 border-b backdrop-blur-md z-20 shrink-0 transition-colors ${
          isDarkMode === false 
            ? "border-zinc-200 bg-[#fafafa]/50 text-zinc-800" 
            : "border-white/5 bg-[#05040a]/40 text-zinc-100"
        }`}>
          <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
            {/* Direct Header Sidebar Toggle Trigger */}
            <button
              id="header-sidebar-toggle-btn"
              onClick={() => {
                setIsSidebarCollapsed(prev => {
                  const newVal = !prev;
                  localStorage.setItem("purplexity_sidebar_collapsed", newVal ? "true" : "false");
                  return newVal;
                });
              }}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer mr-1 flex items-center justify-center shrink-0 ${
                isDarkMode === false 
                  ? "hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 bg-white shadow-sm border border-zinc-200/60" 
                  : "hover:bg-white/10 text-zinc-400 hover:text-white bg-white/5 border border-white/5"
              }`}
              title={isSidebarCollapsed ? "Expand Sidebar (⌘B)" : "Collapse Sidebar (⌘B)"}
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 md:gap-6 overflow-x-auto scrollbar-none whitespace-nowrap py-1 pr-2 max-w-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden min-w-0">
              <button 
                onClick={() => setViewMode("search")} 
                className={`text-xs md:text-sm font-medium pb-1 cursor-pointer transition-all shrink-0 ${
                  viewMode === "search" 
                    ? (isDarkMode === false ? "text-zinc-900 border-b-2 border-purple-600 font-semibold" : "text-white border-b-2 border-purple-500 font-semibold") 
                    : (isDarkMode === false ? "text-zinc-400 hover:text-zinc-700" : "text-zinc-500 hover:text-zinc-350")
                }`}
              >
                Research
              </button>
              <button 
                onClick={() => {
                  setViewMode("dashboard");
                  setDashboardFilterMode("all");
                }}
                className={`text-xs md:text-sm font-medium pb-1 cursor-pointer transition-all shrink-0 ${
                  viewMode === "dashboard" 
                    ? (isDarkMode === false ? "text-zinc-900 border-b-2 border-purple-600 font-semibold" : "text-white border-b-2 border-purple-500 font-semibold") 
                    : (isDarkMode === false ? "text-zinc-400 hover:text-zinc-700" : "text-zinc-500 hover:text-zinc-300")
                }`}
              >
                <span className="hidden sm:inline">Bookmarks & History</span>
                <span className="inline sm:hidden">Library</span>
              </button>
              <button 
                onClick={() => {
                  setViewMode("search");
                  handleNewSearch();
                }}
                className={`text-xs md:text-sm font-medium pb-1 cursor-pointer transition-all shrink-0 ${
                  isDarkMode === false ? "text-zinc-400 hover:text-zinc-700" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Discover
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4 shrink-0 pl-2">
            
            {/* Theme Toggle Button replaces Old GPT/Claude Button */}
            <button
              id="theme-mode-toggle-btn"
              onClick={() => {
                setIsDarkMode(prev => {
                  const newVal = !prev;
                  localStorage.setItem("purplexity_theme", newVal ? "dark" : "light");
                  return newVal;
                });
              }}
              className={`flex items-center gap-1.5 px-2 py-1 md:px-3 md:py-1.5 rounded-full border text-[10px] md:text-xs font-semibold cursor-pointer select-none transition-all ${
                isDarkMode === false
                  ? "bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-700 shadow-sm"
                  : "bg-zinc-900 hover:bg-zinc-800 border-white/5 text-zinc-300"
              }`}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-3 md:w-3.5 h-3 md:h-3.5 text-amber-400 fill-amber-400/10" />
                  <span className="hidden xs:inline">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3 md:w-3.5 h-3 md:h-3.5 text-purple-600 fill-purple-600/10" />
                  <span className="hidden xs:inline">Dark Mode</span>
                </>
              )}
            </button>

            {/* Real User Profile Avatar placed in Top Right Corner */}
            <div 
              id="header-user-avatar"
              className={`w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shadow-md uppercase shrink-0 select-none border ${
                isDarkMode === false ? "border-zinc-200" : "border-white/10"
              }`}
              title={authUser?.email || "User Account"}
            >
              {authUser?.email ? authUser.email.slice(0, 2) : "US"}
            </div>
          </div>
        </header>

        {/* Core Scroll View Canvas */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col items-center relative">
          
          <div className={`w-full ${viewMode === "dashboard" ? "max-w-5xl" : "max-w-3xl"} flex-1 flex flex-col ${viewMode === "search" && !activeSession && !isSearching ? "justify-center" : ""}`}>
            
            <AnimatePresence mode="wait">
              
              {/* Dedicated Library & Bookmarks Dashboard section */}
              {viewMode === "dashboard" && (
                <DashboardView
                  sessions={sessions}
                  bookmarks={bookmarks}
                  dashboardSearchQuery={dashboardSearchQuery}
                  setDashboardSearchQuery={setDashboardSearchQuery}
                  dashboardFilterMode={dashboardFilterMode}
                  setDashboardFilterMode={setDashboardFilterMode}
                  setActiveSessionId={setActiveSessionId}
                  setViewMode={setViewMode}
                  handleDeleteSession={handleDeleteSession}
                  handleCopyClipboard={handleCopyClipboard}
                  copiedBookmarkId={copiedBookmarkId}
                  saveBookmarks={saveBookmarks}
                  renderFormattedAnswer={renderFormattedAnswer}
                  isDarkMode={isDarkMode}
                />
              )}

              {/* LANDING SCREEN DEFAULT - NO ACTIVE THREAD */}
              {viewMode === "search" && !activeSession && !isSearching && (
                <LandingSearchPanel
                  query={query}
                  setQuery={setQuery}
                  activeMode={activeMode}
                  setActiveMode={setActiveMode}
                  isSearching={isSearching}
                  runSearch={runSearch}
                  handleKeyDown={handleKeyDown}
                  searchInputRef={searchInputRef}
                  selectedModel={selectedModel}
                  setSelectedModel={setSelectedModel}
                  isDarkMode={isDarkMode}
                />
              )}

              {/* ACTIVE SESSION DISPLAY GRID */}
              {viewMode === "search" && (activeSession || isSearching) && (
                <ChatResultPanel
                  activeSession={activeSession}
                  isSearching={isSearching}
                  searchPercentage={searchPercentage}
                  searchSteps={searchSteps}
                  errorStatus={errorStatus}
                  bookmarks={bookmarks}
                  handleToggleBookmark={handleToggleBookmark}
                  query={query}
                  setQuery={setQuery}
                  activeMode={activeMode}
                  setActiveMode={setActiveMode}
                  runSearch={runSearch}
                  handleKeyDown={handleKeyDown}
                  messagesEndRef={messagesEndRef}
                  renderFormattedAnswer={renderFormattedAnswer}
                  viewMode={viewMode}
                  selectedModel={selectedModel}
                  setSelectedModel={setSelectedModel}
                  isDarkMode={isDarkMode}
                  isCollapsed={isSidebarCollapsed}
                />
              )}
            </AnimatePresence>

          </div>

        </div>

      </main>

    </div>
  );
}
