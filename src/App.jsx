import React, { useState, useEffect, useRef } from "react";
import { RefreshCw } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { AuthPage } from "./components/AuthPage";
import { Sidebar } from "./components/Sidebar";
import { LandingSearchPanel } from "./components/LandingSearchPanel";
import { DashboardView } from "./components/DashboardView";
import { ChatResultPanel } from "./components/ChatResultPanel";
import { Header } from "./components/Header";

// Import custom hooks and services
import { useAuth } from "./hooks/useAuth";
import { useUserData } from "./hooks/useUserData";
import { executeSearch } from "./services/api";
import { renderFormattedAnswer } from "./utils/markdownParser";

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState("google/gemini-2.5-flash");
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("purplexity_theme") !== "light");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem("purplexity_sidebar_collapsed") === "true");
  const [activeMode, setActiveMode] = useState("standard");
  const [isSearching, setIsSearching] = useState(false);
  const [searchSteps, setSearchSteps] = useState([]);
  const [searchPercentage, setSearchPercentage] = useState(0);
  const [errorStatus, setErrorStatus] = useState(null);

  // User bookmarks & dashboard visual view states
  const [viewMode, setViewMode] = useState("search");
  const [dashboardSearchQuery, setDashboardSearchQuery] = useState("");
  const [dashboardFilterMode, setDashboardFilterMode] = useState("all");
  const [copiedBookmarkId, setCopiedBookmarkId] = useState(null);

  const messagesEndRef = useRef(null);
  const searchInputRef = useRef(null);

  // Load Auth Hooks
  const {
    authUser,
    authToken,
    isAuthLoading,
    handleAuthSuccess,
    handleSignOut
  } = useAuth();

  // Load User Data Hook
  const {
    sessions,
    activeSessionId,
    setActiveSessionId,
    bookmarks,
    saveSessions,
    saveBookmarks,
    handleToggleBookmark,
    handleDeleteSession,
    handleClearHistory
  } = useUserData(authUser, authToken, isAuthLoading);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  // Keyboard shortcut listener to toggle sidebar and start a new thread
  useEffect(() => {
    const handleKeyDownShortcut = (e) => {
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

    window.addEventListener("keydown", handleKeyDownShortcut);
    return () => {
      window.removeEventListener("keydown", handleKeyDownShortcut);
    };
  }, []);

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

      const data = await executeSearch(userPrompt, currentHistory, currentMode, selectedModel);

      // Clear search intervals
      stepIntervals.forEach(clearTimeout);

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

  // Bind theme setting state to pure formatting module
  const renderFormattedAnswerBound = (text, citations = []) => {
    return renderFormattedAnswer(text, citations, isDarkMode);
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
        : "bg-[#05040a] text-zinc-100"
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
        <Header
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          viewMode={viewMode}
          setViewMode={setViewMode}
          setDashboardFilterMode={setDashboardFilterMode}
          handleNewSearch={handleNewSearch}
          authUser={authUser}
        />

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
                  renderFormattedAnswer={renderFormattedAnswerBound}
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
                  renderFormattedAnswer={renderFormattedAnswerBound}
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
