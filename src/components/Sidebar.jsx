import React from "react";
import { 
  Trash2, 
  LogOut, 
  Sparkles, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  BookOpen, 
  PenTool, 
  History
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { PurplexityLogo } from "./PurplexityLogo";

export const Sidebar = ({
  sessions,
  activeSessionId,
  setActiveSessionId,
  authUser,
  handleSignOut,
  handleDeleteSession,
  handleClearHistory,
  handleNewSearch,
  setViewMode,
  setErrorStatus,
  isDarkMode = true,
  isCollapsed,
  onToggleCollapse,
}) => {
  return (
    <aside
      id="sidebar-container"
      className={`border-r flex flex-col shrink-0 z-40 transition-all duration-300 ease-in-out overflow-y-auto overflow-x-hidden ${
        isCollapsed 
          ? "max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:-translate-x-full md:relative md:w-[72px] p-3" 
          : "max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:translate-x-0 max-md:shadow-2xl md:relative md:w-64 p-4"
      } ${
        isDarkMode === false 
          ? "bg-[#f4f3f8] border-r-zinc-200 text-zinc-800" 
          : "border-white/5 bg-[#080710] text-zinc-100"
      }`}
    >
      {/* Brand Header */}
      <div className={`flex items-center select-none ${isCollapsed ? "flex-col gap-3 justify-center mb-6" : "justify-between mb-8"}`}>
        <div 
          id="brand-header-trigger"
          className="flex items-center gap-2 cursor-pointer" 
          onClick={handleNewSearch}
          title="Return to search"
        >
          <PurplexityLogo size={28} className="shrink-0 filter drop-shadow-[0_2px_8px_rgba(124,58,237,0.2)]" />
          {!isCollapsed && (
            <span className={`text-xl font-bold tracking-tight font-sans transition-opacity duration-200 ${
              isDarkMode === false ? "text-zinc-900" : "text-white"
            }`}>
              Purplexity
            </span>
          )}
        </div>
        
        <button
          id="sidebar-toggle-btn"
          onClick={() => onToggleCollapse(!isCollapsed)}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isDarkMode === false 
              ? "hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900" 
              : "hover:bg-white/5 text-zinc-400 hover:text-white"
          }`}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* New Thread Trigger */}
      {isCollapsed ? (
        <button 
          id="new-thread-btn-collapsed"
          onClick={handleNewSearch}
          className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all cursor-pointer mx-auto mb-6 hover:scale-[1.05] ${
            isDarkMode === false 
              ? "border-zinc-200 hover:border-purple-300 hover:bg-zinc-100 text-purple-705 text-purple-700 bg-white shadow-sm"
              : "border-white/10 hover:border-purple-500/30 hover:bg-white/5 text-purple-400 bg-[#0c0a1b]"
          }`}
          title="New Thread (⌘K)"
        >
          <Plus className="w-5 h-5 text-purple-400" />
        </button>
      ) : (
        <button 
          id="new-thread-btn"
          onClick={handleNewSearch}
          className={`w-full flex items-center justify-between border rounded-full px-5 py-2.5 mb-6 text-sm transition-all group cursor-pointer ${
            isDarkMode === false 
              ? "border-zinc-200 hover:border-purple-300 hover:bg-zinc-100 text-zinc-700 hover:text-purple-700 font-medium"
              : "border-white/10 hover:border-purple-500/30 hover:bg-white/5 text-zinc-400 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2 font-medium">
            <Plus className="w-4 h-4 text-purple-400 group-hover:rotate-90 transition-transform duration-300" />
            New Thread
          </span>
          <span className={`${isDarkMode === false ? "text-zinc-400 group-hover:text-purple-500" : "text-zinc-600 group-hover:text-purple-400"} text-[10px] font-mono transition-colors`}>⌘K</span>
        </button>
      )}

      {/* Library History View Controller */}
      <div className={`select-none pr-1 ${
        isCollapsed 
          ? "shrink-0 flex flex-col items-center gap-2 mt-4" 
          : "flex-1 overflow-y-auto min-h-[140px] space-y-1"
      }`}>
        {isCollapsed ? (
          <button
            id="sidebar-collapsed-history-btn"
            onClick={() => {
              setViewMode("dashboard");
            }}
            className={`w-11 h-11 rounded-full relative flex items-center justify-center transition-all cursor-pointer hover:scale-105 ${
              isDarkMode === false 
                ? "hover:bg-zinc-200 text-zinc-650 border border-zinc-200 bg-white shadow-sm" 
                : "hover:bg-white/5 text-zinc-400 bg-zinc-900/40 border border-white/5"
            }`}
            title="View Search Library History"
          >
            <History className="w-5 h-5 text-purple-400" />
            {sessions.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-purple-600 text-white font-mono text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-md font-bold">
                {sessions.length}
              </span>
            )}
          </button>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3 px-2">
              <span className={`text-[10px] font-bold uppercase tracking-widest font-mono ${
                isDarkMode === false ? "text-zinc-400" : "text-zinc-500"
              }`}>
                Library History
              </span>
              {sessions.length > 0 && (
                <button 
                  id="clear-all-sessions-btn"
                  onClick={handleClearHistory}
                  className={`text-[9px] flex items-center gap-1 cursor-pointer transition-colors ${
                    isDarkMode === false ? "text-zinc-400 hover:text-red-500" : "text-zinc-505 text-zinc-500 hover:text-red-400"
                  }`}
                  title="Clear all search history"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="space-y-1">
              <AnimatePresence initial={false}>
                {sessions.length === 0 ? (
                  <div className={`p-4 text-center text-xs rounded-lg border border-dashed select-none font-mono ${
                    isDarkMode === false
                      ? "border-zinc-200 text-zinc-405 text-zinc-400 bg-zinc-50/50"
                      : "border-white/5 text-zinc-500 bg-white/0"
                  }`}>
                    No active threads
                  </div>
                ) : (
                  sessions.map((sess) => (
                    <motion.div
                      id={`sidebar-sess-${sess.id}`}
                      key={sess.id}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      onClick={() => {
                        setActiveSessionId(sess.id);
                        setErrorStatus(null);
                        setViewMode("search");
                      }}
                      className={`px-3 py-2 rounded-lg text-xs cursor-pointer transition-all flex items-center justify-between group ${
                        sess.id === activeSessionId 
                          ? (isDarkMode === false 
                            ? "bg-purple-100 text-purple-950 border-l-2 border-purple-600 font-semibold" 
                            : "bg-purple-900/10 text-purple-200 border-l-2 border-purple-500 font-medium")
                          : (isDarkMode === false 
                            ? "text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-950" 
                            : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200")
                      }`}
                    >
                      <span className="truncate flex-1 mr-2">{sess.title}</span>
                      <button
                        id={`delete-sess-icon-${sess.id}`}
                        onClick={(e) => handleDeleteSession(sess.id, e)}
                        className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all cursor-pointer flex-shrink-0 ${
                          isDarkMode === false 
                            ? "hover:bg-zinc-200 text-zinc-500 hover:text-red-500" 
                            : "hover:bg-white/10 text-zinc-500 hover:text-red-400"
                        }`}
                        title="Delete thread"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      {/* User Account Bar */}
      <div 
        id="user-profile-bar" 
        className={`mt-4 pt-4 border-t flex items-center justify-between gap-2.5 select-none ${
          isCollapsed ? "flex-col items-center" : "flex-row"
        } ${
          isDarkMode === false ? "border-zinc-200" : "border-white/5"
        }`}
      >
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-3">
            <button 
              id="logout-btn-collapsed"
              onClick={handleSignOut}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDarkMode === false ? "hover:bg-zinc-200 text-zinc-550 text-zinc-500 hover:text-zinc-950" : "hover:bg-white/10 text-zinc-500 hover:text-white"
              }`}
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="flex-1 overflow-hidden">
                <div className={`text-xs font-semibold truncate ${isDarkMode === false ? "text-zinc-805 text-zinc-800" : "text-zinc-300"}`} title={authUser?.email}>
                  {authUser?.email}
                </div>
                <div className="text-[9px] text-purple-400 font-mono tracking-wide uppercase">
                  Workspace Profile
                </div>
              </div>
            </div>
            
            <button 
              id="logout-btn"
              onClick={handleSignOut}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDarkMode === false ? "hover:bg-zinc-200 text-zinc-550 text-zinc-500 hover:text-zinc-950" : "hover:bg-white/10 text-zinc-500 hover:text-white"
              }`}
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </aside>
  );
};
