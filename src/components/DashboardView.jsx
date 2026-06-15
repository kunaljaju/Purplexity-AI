import React from "react";
import { Search, Calendar, Trash2, Star, Copy, Check, X } from "lucide-react";
import { motion } from "motion/react";

export const DashboardView = ({
  sessions,
  bookmarks,
  dashboardSearchQuery,
  setDashboardSearchQuery,
  dashboardFilterMode,
  setDashboardFilterMode,
  setActiveSessionId,
  setViewMode,
  handleDeleteSession,
  handleCopyClipboard,
  copiedBookmarkId,
  saveBookmarks,
  renderFormattedAnswer,
  isDarkMode = true,
}) => {
  return (
    <motion.div
      id="dashboard-container"
      key="dashboard_view"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full flex-grow flex flex-col pt-2 pb-24 text-left"
    >
      {/* Dashboard Header Banner */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 mb-8 select-none ${
        isDarkMode === false ? "border-zinc-200" : "border-white/5"
      }`}>
        <div>
          <h2 className={`text-3xl font-light tracking-tight flex items-center gap-2 font-sans ${
            isDarkMode === false ? "text-zinc-805 text-zinc-800" : "text-white"
          }`}>
            <span>Personal</span>
            <span className="italic font-serif text-purple-600 font-medium">knowledge grid</span>
          </h2>
          <p className={`text-xs mt-1 ${isDarkMode === false ? "text-zinc-500" : "text-zinc-400"}`}>
            Explore your deep search history, custom citations, and saved findings.
          </p>
        </div>

        {/* Stats counters grid */}
        <div id="dashboard-stats-grid" className="flex gap-3 text-left">
          <div className={`p-3 rounded-2xl flex flex-col justify-center min-w-[100px] text-center border ${
            isDarkMode === false ? "bg-zinc-100/60 border-zinc-200" : "bg-white/5 border-white/5"
          }`}>
            <span className="text-xl font-bold font-mono text-purple-600">{sessions.length}</span>
            <span className="text-[10px] text-zinc-500 font-medium font-sans">Research Threads</span>
          </div>
          <div className={`p-3 rounded-2xl flex flex-col justify-center min-w-[100px] text-center border ${
            isDarkMode === false ? "bg-zinc-100/60 border-zinc-200" : "bg-white/5 border-white/5"
          }`}>
            <span className="text-xl font-bold font-mono text-purple-600">{bookmarks.length}</span>
            <span className="text-[10px] text-zinc-500 font-medium font-sans">Bookmarks</span>
          </div>
        </div>
      </div>

      {/* Search and Filters Hub */}
      <div id="dashboard-filters-hub" className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6 w-full">
        {/* Filter Category Tabs */}
        <div className={`flex p-1 border rounded-xl self-start md:self-auto select-none font-sans ${
          isDarkMode === false ? "bg-zinc-100 border-zinc-200" : "bg-zinc-900/60 border-white/5"
        }`}>
          {["all", "history", "bookmarks"].map((tab) => (
            <button
              id={`dashboard-tab-${tab}`}
              key={tab}
              onClick={() => setDashboardFilterMode(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                dashboardFilterMode === tab 
                  ? "bg-purple-600 text-white shadow font-medium" 
                  : (isDarkMode === false ? "text-zinc-500 hover:text-zinc-800" : "text-zinc-400 hover:text-zinc-205 hover:text-zinc-200")
              }`}
            >
              {tab === "all" ? "All Library" : tab === "history" ? "Search Threads" : "Saved Findings"}
            </button>
          ))}
        </div>

        {/* Search bar inputs */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
          <input
            id="dashboard-search-input"
            type="text"
            value={dashboardSearchQuery}
            onChange={(e) => setDashboardSearchQuery(e.target.value)}
            placeholder="Filter list by term..."
            className={`w-full border rounded-xl pl-9 pr-8 py-2 text-xs outline-none focus:border-purple-500 transition-all font-sans ${
              isDarkMode === false
                ? "bg-white border-zinc-200 text-zinc-800 placeholder-zinc-400"
                : "bg-zinc-900 border-white/5 text-zinc-100 placeholder-zinc-500"
            }`}
          />
          {dashboardSearchQuery && (
            <button 
              id="clear-dashboard-search-btn"
              onClick={() => setDashboardSearchQuery("")}
              className={`absolute right-2.5 top-2 ml-1 p-0.5 rounded ${
                isDarkMode === false ? "hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800" : "hover:bg-white/10 text-zinc-400 hover:text-white"
              }`}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Dual Grid Layout */}
      <div id="dashboard-items-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        
        {/* COLUMN 1: SESSIONS / HISTORIC THREADS */}
        {(dashboardFilterMode === "all" || dashboardFilterMode === "history") && (
          <div className={`${dashboardFilterMode === "history" ? "lg:col-span-12" : "lg:col-span-12 xl:col-span-5"} space-y-3 w-full`}>
            <div className="flex items-center justify-between px-1 select-none">
              <span className="text-[11px] font-bold text-zinc-505 text-zinc-500 uppercase tracking-wider font-mono">Recent Research Threads</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                isDarkMode === false ? "bg-zinc-100 text-zinc-600" : "bg-white/5 text-zinc-505 text-zinc-500"
              }`}>{sessions.length} items</span>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {sessions.filter(s => 
                s.title?.toLowerCase().includes(dashboardSearchQuery.toLowerCase()) || 
                s.messages?.some(m => m.content?.toLowerCase().includes(dashboardSearchQuery.toLowerCase()))
              ).length === 0 ? (
                <div className={`p-8 text-center border rounded-2xl text-xs select-none ${
                  isDarkMode === false ? "border-zinc-200 bg-zinc-50" : "border-white/5 bg-zinc-950/20 text-zinc-550 text-zinc-500"
                }`}>
                  No threads match search term.
                </div>
              ) : (
                sessions.filter(s => 
                  s.title?.toLowerCase().includes(dashboardSearchQuery.toLowerCase()) || 
                  s.messages?.some(m => m.content?.toLowerCase().includes(dashboardSearchQuery.toLowerCase()))
                ).map((sess) => {
                  const assistantMessages = sess.messages.filter(m => m.role === "assistant");
                  const citationCount = assistantMessages.reduce((sum, m) => sum + (m.citations?.length || 0), 0);
                  const questionsCount = sess.messages.filter(m => m.role === "user").length;

                  return (
                    <div
                      id={`dashboard-sess-card-${sess.id}`}
                      key={sess.id}
                      onClick={() => {
                        setActiveSessionId(sess.id);
                        setViewMode("search");
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between hover:-translate-y-[1px] relative select-none ${
                        isDarkMode === false 
                          ? "bg-white border-zinc-200 hover:border-purple-300 shadow-sm"
                          : "bg-[#101018]/50 border-white/5 hover:bg-[#151522]/60 hover:border-purple-500/10"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] px-2 py-0.5 border rounded-full font-mono uppercase font-bold tracking-wide ${
                            isDarkMode === false 
                              ? "bg-purple-50 border-purple-200 text-purple-705 text-purple-700"
                              : "bg-purple-900/30 text-purple-300 border-purple-800/10"
                          }`}>
                            {sess.mode} Engine
                          </span>
                          <span className="text-[10px] text-zinc-550 text-zinc-500 font-mono flex items-center gap-1">
                            <Calendar className="w-3" />
                            {sess.createdAt}
                          </span>
                        </div>
                        <h4 className={`text-sm font-semibold mt-2 hover:text-purple-600 transition-colors line-clamp-1 ${
                          isDarkMode === false ? "text-zinc-800" : "text-zinc-200"
                        }`}>
                          {sess.title}
                        </h4>
                        <p className={`text-xs mt-1 line-clamp-2 ${
                          isDarkMode === false ? "text-zinc-500" : "text-zinc-400"
                        }`}>
                          {sess.messages[sess.messages.length - 1]?.content.trim().slice(0, 140)}...
                        </p>
                      </div>

                      <div className={`flex items-center justify-between border-t pt-2.5 mt-3 text-[11px] text-zinc-500 ${
                        isDarkMode === false ? "border-zinc-100" : "border-white/5"
                      }`}>
                        <div className="flex gap-3">
                          <span>Turns: <strong>{questionsCount}</strong></span>
                          {citationCount > 0 && (
                            <span className="text-purple-600 font-semibold">Sources: <strong>{citationCount}</strong></span>
                          )}
                        </div>
                        <button
                          id={`dash-delete-sess-btn-${sess.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSession(sess.id, e);
                          }}
                          className={`p-1 rounded transition-colors ${
                            isDarkMode === false ? "text-zinc-400 hover:text-red-500 hover:bg-zinc-100" : "text-zinc-500 hover:text-red-400 hover:bg-[#151522]"
                          }`}
                          title="Delete thread"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* COLUMN 2: BOOKMARKED FINDINGS Snippets list */}
        {(dashboardFilterMode === "all" || dashboardFilterMode === "bookmarks") && (
          <div className={`${dashboardFilterMode === "bookmarks" ? "lg:col-span-12" : "lg:col-span-12 xl:col-span-7"} space-y-3 w-full`}>
            <div className="flex items-center justify-between px-1 select-none">
              <span className="text-[11px] font-bold text-zinc-550 text-zinc-500 uppercase tracking-wider font-mono">Bookmarked Findings</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                isDarkMode === false ? "bg-zinc-100 text-zinc-600" : "bg-white/5 text-zinc-550 text-zinc-500"
              }`}>{bookmarks.length} saved</span>
            </div>

            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1">
              {bookmarks.filter(b => 
                b.queryText?.toLowerCase().includes(dashboardSearchQuery.toLowerCase()) || 
                b.content?.toLowerCase().includes(dashboardSearchQuery.toLowerCase()) ||
                b.sessionTitle?.toLowerCase().includes(dashboardSearchQuery.toLowerCase())
              ).length === 0 ? (
                <div className={`p-12 text-center border border-dashed rounded-2xl select-none ${
                  isDarkMode === false ? "border-zinc-200 bg-zinc-50" : "border-white/5 bg-zinc-950/20 text-zinc-550 text-zinc-500"
                }`}>
                  <Star className="w-10 h-10 text-zinc-400 mx-auto stroke-[1.5] mb-3 animate-pulse" />
                  <p className={`font-semibold text-xs ${isDarkMode === false ? "text-zinc-700" : "text-zinc-400"}`}>No bookmarks saved yet.</p>
                  <p className="text-zinc-550 text-zinc-500 text-[11px] max-w-xs mx-auto mt-2 leading-relaxed">
                    Bookmark helpful assistant messages during active searches to view snippets in this dashboard workspace.
                  </p>
                </div>
              ) : (
                bookmarks.filter(b => 
                  b.queryText?.toLowerCase().includes(dashboardSearchQuery.toLowerCase()) || 
                  b.content?.toLowerCase().includes(dashboardSearchQuery.toLowerCase()) ||
                  b.sessionTitle?.toLowerCase().includes(dashboardSearchQuery.toLowerCase())
                ).map((b) => (
                  <div
                    id={`bookmark-card-${b.id}`}
                    key={b.id}
                    className={`p-5 rounded-2xl border backdrop-blur-md relative hover:border-purple-500/20 transition-all flex flex-col justify-between ${
                      isDarkMode === false 
                        ? "bg-white border-zinc-200 shadow-sm" 
                        : "bg-[#101018]/75 border-white/10"
                    }`}
                  >
                    <div>
                      {/* Bookmark title metadata header */}
                      <div className={`flex items-center justify-between mb-3 border-b pb-2.5 select-none text-left ${
                        isDarkMode === false ? "border-zinc-100" : "border-white/5"
                      }`}>
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></span>
                          <span 
                            onClick={() => {
                              setActiveSessionId(b.sessionId);
                              setViewMode("search");
                            }}
                            className="text-[10px] text-purple-600 hover:underline font-mono truncate font-semibold cursor-pointer"
                            title="Click to view full thread session"
                          >
                            In: {b.sessionTitle}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <span className={`text-[9px] px-2 py-0.5 border rounded-full font-mono uppercase font-bold tracking-wider ${
                            isDarkMode === false 
                              ? "bg-purple-50 border-purple-200 text-purple-705 text-purple-700" 
                              : "bg-white/5 border-white/5 text-zinc-400"
                          }`}>
                            {b.modeUsed} view
                          </span>
                          <span className="text-[10px] text-zinc-550 text-zinc-500 font-mono">{b.bookmarkedAt}</span>
                        </div>
                      </div>

                      {/* User Question */}
                      <div className="mb-4 text-left font-sans">
                        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Inquiry:</span>
                        <h4 className={`text-xs font-semibold mt-1 ${isDarkMode === false ? "text-zinc-800" : "text-zinc-200"}`}>
                          {b.queryText}
                        </h4>
                      </div>

                      {/* Answer Preview Container */}
                      <div className={`relative rounded-xl border p-4 mb-4 select-text text-left ${
                        isDarkMode === false 
                          ? "bg-zinc-50/50 border-zinc-200" 
                          : "bg-[#08070e] border-white/5"
                      }`}>
                        <span className="absolute top-2 right-3 text-[9px] uppercase font-bold tracking-widest text-zinc-400 font-mono">Snippet Answer</span>
                        <div className={`mt-2 text-xs font-sans leading-relaxed overflow-y-auto max-h-48 scrollbar-thin ${
                          isDarkMode === false ? "text-black" : "text-gray-300"
                        }`}>
                          {renderFormattedAnswer(b.content, b.citations)}
                        </div>
                      </div>

                      {/* CITATIONS Source cards */}
                      {b.citations && b.citations.length > 0 && (
                        <div className="mb-4 text-left select-none">
                          <div className="text-[9px] uppercase font-bold text-zinc-550 text-zinc-500 tracking-wider mb-2 font-mono">Sources Referenced:</div>
                          <div className="flex flex-wrap gap-1.5">
                            {b.citations.map((cite) => (
                              <a
                                key={cite.id}
                                href={cite.url}
                                target="_blank"
                                referrerPolicy="no-referrer"
                                className={`inline-flex items-center gap-1 px-2.5 py-1 border rounded-lg text-[10px] font-mono transition-colors ${
                                  isDarkMode === false 
                                    ? "bg-zinc-100 border-zinc-200 hover:bg-zinc-200 text-purple-705 text-purple-700" 
                                    : "bg-white/5 border-white/5 hover:bg-white/10 text-purple-300"
                                }`}
                                title={cite.title}
                              >
                                <span className="text-purple-600 font-black">[{cite.id}]</span>
                                <span className="truncate max-w-[120px]">{cite.title}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bookmark Quick Interactivity Toolbar */}
                    <div className={`border-t pt-3.5 mt-2 flex items-center justify-between text-xs text-zinc-500 font-sans ${
                      isDarkMode === false ? "border-zinc-100" : "border-white/5"
                    }`}>
                      <button
                        id={`explore-from-bookmark-btn-${b.id}`}
                        onClick={() => {
                          setActiveSessionId(b.sessionId);
                          setViewMode("search");
                        }}
                        className="p-1.5 px-3.5 bg-purple-600 hover:bg-purple-500 hover:text-white rounded-xl text-[11px] font-semibold text-white transition-all transform hover:scale-102 cursor-pointer shadow-lg shadow-purple-500/10"
                      >
                        Explore Full Thread
                      </button>

                      <div className="flex gap-2">
                        <button
                          id={`copy-bookmark-btn-${b.id}`}
                          onClick={() => handleCopyClipboard(b.content, b.id)}
                          className={`p-1.5 px-3 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 text-[11px] ${
                            copiedBookmarkId === b.id 
                              ? "bg-green-600/20 border-green-500/30 text-green-600" 
                              : (isDarkMode === false
                                ? "bg-zinc-100 border-zinc-200 text-zinc-500 hover:bg-zinc-200"
                                : "bg-white/5 border-white/5 text-zinc-300 hover:bg-white/10 hover:text-zinc-200")
                          }`}
                        >
                          {copiedBookmarkId === b.id ? <Check className="w-3.5 h-3.5 animate-bounce" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedBookmarkId === b.id ? "Copied" : "Copy findings"}</span>
                        </button>
                        
                        <button
                          id={`remove-bookmark-btn-${b.id}`}
                          onClick={() => {
                            const updated = bookmarks.filter((x) => x.id !== b.id);
                            saveBookmarks(updated);
                          }}
                          className="p-1.5 px-2 rounded-lg border border-red-500/20 bg-red-950/10 text-red-500 hover:bg-red-900/25 transition-colors cursor-pointer"
                          title="Unbookmark snippet"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </motion.div>
  );
};
