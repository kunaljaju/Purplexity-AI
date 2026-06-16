import React, { useState } from "react";
import { 
  Search, Star, Loader2, Info, RefreshCw, Compass, 
  ChevronRight, ArrowUp, FileText, Globe, ExternalLink, Cpu, ChevronDown,
  Sparkles, BookOpen, PenTool
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { PurplexityLogo } from "./PurplexityLogo";

const AVAILABLE_MODELS = [
  { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { id: "meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B" },
  { id: "meta-llama/llama-3.2-3b-instruct:free", label: "Llama 3.2 3B" },
  { id: "nousresearch/hermes-3-llama-3.1-405b:free", label: "Hermes 3 405B" },
  { id: "google/gemma-4-31b-it:free", label: "Gemma 4 31B" },
  { id: "qwen/qwen3-coder:free", label: "Qwen 3 Coder" },
  { id: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free", label: "Dolphin Mistral 24B" },
];

const AVAILABLE_MODES = [
  { id: "standard", label: "Standard Search" },
  { id: "copilot", label: "Copilot Research" },
  { id: "academic", label: "Academic Literature" },
  { id: "writing", label: "Creative Writing" },
];

const ModeIconMap = {
  standard: Search,
  copilot: Sparkles,
  academic: BookOpen,
  writing: PenTool,
};

// Inner component to encapsulate local state for Results vs Sources tabs beautifully
const AssistantMessageItem = ({
  message,
  activeSession,
  bookmarks,
  handleToggleBookmark,
  renderFormattedAnswer,
  setQuery,
  runSearch,
  isDarkMode = true,
}) => {
  const [activeTab, setActiveTab] = useState("results");
  const citationCount = message.citations ? message.citations.length : 0;
  const isBookmarked = bookmarks.some((b) => b.id === message.id || b.messageId === message.id);

  return (
    <motion.div 
      id={`chat-turn-${message.id}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`p-6 rounded-2xl border backdrop-blur-md text-left transition-all ${
        isDarkMode === false 
          ? "bg-white border-zinc-200 shadow-sm" 
          : "bg-[#101018]/60 border-white/10"
      }`}
    >
      {/* Card Identity Header */}
      <div className="flex items-center justify-between mb-4 select-none">
        <div className="flex items-center gap-3">
          <PurplexityLogo size={28} className="shrink-0" />
          <div>
            <p className={`text-xs font-semibold ${isDarkMode === false ? "text-zinc-800" : "text-zinc-200"}`}>
              Purplexity
            </p>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
              {message.timestamp}
            </p>
          </div>
        </div>

        {/* Save Finding/Bookmark trigger */}
        <button
          id={`toggle-bookmark-btn-${message.id}`}
          onClick={() => handleToggleBookmark(message.id, activeSession.id)}
          className={`p-1 px-2.5 rounded-md border text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
            isBookmarked 
              ? "bg-purple-600/20 border-purple-500/30 text-purple-300 shadow-sm" 
              : (isDarkMode === false
                ? "bg-zinc-105 bg-zinc-100 border-zinc-200 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800"
                : "bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200")
          }`}
          title={isBookmarked ? "Remove Bookmark" : "Save finding to bookmarks"}
        >
          <Star className={`w-3.5 h-3.5 ${isBookmarked ? "fill-purple-400 text-purple-400" : ""}`} />
          <span>{isBookmarked ? "Saved" : "Save finding"}</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* Searched queries tag info */}
        {message.searchQueries && message.searchQueries.length > 0 && (
          <div className={`flex flex-wrap items-center gap-2 border-b pb-3 ${isDarkMode === false ? "border-zinc-100" : "border-white/5"}`}>
            <span className="text-[10px] text-purple-500 font-mono uppercase tracking-wider font-semibold mr-1 select-none">Web crawlers targeted:</span>
            {message.searchQueries.map((queryText, qIdx) => (
              <span key={qIdx} className={`text-[10px] px-2.5 py-1 rounded border flex items-center gap-1.5 leading-none select-none ${
                isDarkMode === false 
                  ? "bg-zinc-100 border-zinc-200 text-zinc-600" 
                  : "bg-white/5 border-white/5 text-zinc-300"
              }`}>
                <Search className="w-3 h-3 text-purple-500" />
                <span>{queryText}</span>
              </span>
            ))}
          </div>
        )}

        {/* Dynamic Navigation Tabs: always with specific format: Results and Sources buttons */}
        <div className={`flex gap-2 p-1 border rounded-xl self-start max-w-sm select-none ${
          isDarkMode === false ? "bg-zinc-100 border-zinc-200" : "bg-white/5 border-white/5"
        }`}>
          <button
            id={`tab-results-btn-${message.id}`}
            onClick={() => setActiveTab("results")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              activeTab === "results" 
                ? "bg-purple-600 text-white shadow-md font-medium" 
                : (isDarkMode === false ? "text-zinc-500 hover:text-zinc-800" : "text-zinc-400 hover:text-zinc-200")
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Results</span>
          </button>
          <button
            id={`tab-sources-btn-${message.id}`}
            onClick={() => setActiveTab("sources")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              activeTab === "sources" 
                ? "bg-purple-600 text-white shadow-md font-medium" 
                : (isDarkMode === false ? "text-zinc-500 hover:text-zinc-800" : "text-zinc-400 hover:text-zinc-200")
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Sources ({citationCount})</span>
          </button>
        </div>

        {/* Tabs Content Render Area */}
        {activeTab === "results" ? (
          /* Tab Panel: Synthesized Text Answer */
          <motion.div
            key="results-panel"
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            className={`pl-1 prose max-w-none prose-sm ${
              isDarkMode === false ? "prose-stone text-black" : "prose-invert text-zinc-100"
            }`}
          >
            {renderFormattedAnswer(message.content, message.citations)}
          </motion.div>
        ) : (
          /* Tab Panel: Crawled Web Citations/Sources Cards */
          <motion.div
            key="sources-panel"
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-purple-500 font-mono uppercase tracking-wider font-bold">Top 10 Grounded Browser Links</span>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono ${
                isDarkMode === false ? "bg-zinc-100 text-zinc-650 text-zinc-600" : "bg-white/5 text-zinc-500"
              }`}>{citationCount} sites cached</span>
            </div>

            {citationCount === 0 ? (
              <div className={`p-8 border border-dashed rounded-xl text-center text-xs ${
                isDarkMode === false ? "border-zinc-200 text-zinc-400 bg-zinc-50/50" : "border-white/5 text-zinc-500"
              }`}>
                No web sources were scraped for this offline operation.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {message.citations?.map((cite) => {
                  let domain = "web";
                  try {
                    domain = new URL(cite.url).hostname;
                  } catch (e) {}

                  return (
                    <div
                      key={cite.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between group flex-grow text-left relative ${
                        isDarkMode === false 
                          ? "bg-white border-zinc-200 hover:border-purple-300 shadow-sm"
                          : "bg-white/5 border-white/5 hover:border-purple-500/20"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <img
                              src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`}
                              alt=""
                              className="w-4 h-4 rounded object-cover flex-shrink-0"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                            <span className="text-[10px] text-purple-600 font-mono truncate font-semibold">
                              {domain.replace("www.", "")}
                            </span>
                          </div>
                          
                          {/* Top corner numeric match badge */}
                          <span className={`px-2 py-0.5 font-mono text-[9px] font-bold rounded-md border ${
                            isDarkMode === false 
                              ? "bg-purple-55 bg-purple-50 border-purple-250 border-purple-200 text-purple-705 text-purple-700" 
                              : "bg-purple-950/40 border-purple-800/10 text-purple-400"
                          }`}>
                            Source [{cite.id}]
                          </span>
                        </div>

                        <h4 className={`text-xs font-bold line-clamp-1 mb-1 group-hover:text-purple-600 transition-colors ${
                          isDarkMode === false ? "text-zinc-800" : "text-zinc-100"
                        }`}>
                          {cite.title}
                        </h4>

                        <p className={`text-[11px] line-clamp-3 leading-relaxed mb-3 ${
                          isDarkMode === false ? "text-zinc-500" : "text-zinc-400"
                        }`}>
                          {cite.snippet || "No additional text content snippet cached from this browser node."}
                        </p>
                      </div>

                      <div className={`pt-2 border-t flex items-center justify-between ${isDarkMode === false ? "border-zinc-100" : "border-white/5"}`}>
                        <span className="text-[9px] text-zinc-500 font-mono truncate max-w-[150px]">
                          {cite.url}
                        </span>
                        
                        <a
                          href={cite.url}
                          target="_blank"
                          referrerPolicy="no-referrer"
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono transition-colors cursor-pointer ${
                            isDarkMode === false 
                              ? "bg-zinc-100 text-zinc-700 hover:text-white hover:bg-purple-600" 
                              : "bg-white/5 text-zinc-305 text-zinc-300 hover:text-white hover:bg-purple-600"
                          }`}
                        >
                          <span>Explore site</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Dynamic context related follow-up suggestions (always 3-4 items) */}
      {message.followUps && message.followUps.length > 0 && (
        <div className={`border-t pt-4 mt-6 ${isDarkMode === false ? "border-zinc-200" : "border-white/5"}`}>
          <p className="text-[11px] text-purple-500 font-mono uppercase tracking-wider mb-2.5 font-bold flex items-center gap-1 select-none">
            <Compass className="w-3.5 h-3.5 text-purple-500" />
            Suggested pathways
          </p>
          <div className="flex flex-col gap-1.5">
            {message.followUps.map((question, qIdx) => (
              <button
                id={`followup-btn-${qIdx}`}
                key={qIdx}
                onClick={() => {
                  setQuery(question);
                  runSearch(question);
                }}
                className={`p-2 px-3 text-left rounded-xl border text-xs transition-all flex items-center justify-between group cursor-pointer ${
                  isDarkMode === false 
                    ? "bg-white border-zinc-200/80 hover:bg-purple-50 hover:border-purple-300 text-purple-700" 
                    : "bg-white/5 border-white/5 hover:border-purple-500/20 text-purple-300 hover:text-purple-100"
                }`}
              >
                <span className="truncate">{question}</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all text-purple-500" />
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export const ChatResultPanel = ({
  activeSession,
  isSearching,
  searchPercentage,
  searchSteps,
  errorStatus,
  bookmarks,
  handleToggleBookmark,
  query,
  setQuery,
  activeMode,
  setActiveMode,
  runSearch,
  handleKeyDown,
  messagesEndRef,
  renderFormattedAnswer,
  viewMode,
  selectedModel,
  setSelectedModel,
  isDarkMode = true,
  isCollapsed = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const getPlaceholderText = (mode) => {
    switch (mode) {
      case "copilot":
        return "Ask a deep research question...";
      case "academic":
        return "Search academic literature and papers...";
      case "writing":
        return "Write or edit code, essays, or stories...";
      default:
        return "Ask follow-up query...";
    }
  };
  return (
    <motion.div
      id="chat-result-panel"
      key="chat"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8 pb-36 w-full mt-4"
    >
      {/* Historic turn items */}
      {activeSession && activeSession.messages.map((message) => {
        if (message.role === "user") {
          return (
            <motion.div 
              id={`chat-turn-${message.id}`}
              key={message.id} 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className={`p-6 rounded-2xl border text-left transition-all ${
                isDarkMode === false 
                  ? "bg-[#f4f3f8] border-zinc-200" 
                  : "bg-white/5 border-white/5 text-zinc-100"
              }`}
            >
              <div className="flex items-center gap-3 mb-3 select-none">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border ${
                  isDarkMode === false 
                    ? "bg-purple-650 bg-purple-600 text-white border-purple-500" 
                    : "bg-purple-950 text-purple-300 border-purple-800/20"
                }`}>
                  U
                </div>
                <div>
                  <p className={`text-xs font-semibold ${isDarkMode === false ? "text-zinc-800" : "text-zinc-200"}`}>You</p>
                  <p className={`text-[10px] mt-0.5 ${isDarkMode === false ? "text-zinc-500" : "text-zinc-500"}`}>{message.timestamp}</p>
                </div>
              </div>
              <p className={`text-sm leading-relaxed font-semibold pl-1 ${
                isDarkMode === false ? "text-zinc-800" : "text-zinc-100"
              }`}>
                {message.content}
              </p>
            </motion.div>
          );
        } else {
          // Assistant response containing interactive results vs sources tabs
          return (
            <AssistantMessageItem
              key={message.id}
              message={message}
              activeSession={activeSession}
              bookmarks={bookmarks}
              handleToggleBookmark={handleToggleBookmark}
              renderFormattedAnswer={renderFormattedAnswer}
              setQuery={setQuery}
              runSearch={runSearch}
              isDarkMode={isDarkMode}
            />
          );
        }
      })}

      {/* LOADING Neural engine state steps */}
      {isSearching && (
        <motion.div
          id="search-loading-container"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-2xl border space-y-4 ${
            isDarkMode === false 
              ? "bg-white border-zinc-200 shadow-lg shadow-zinc-200/30 text-zinc-800" 
              : "bg-[#101018]/70 border-white/10 text-zinc-100"
          }`}
        >
          <div className="flex items-center justify-between select-none">
            <div className="flex items-center gap-2.5">
              <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
              <span className={`text-xs font-semibold font-sans ${isDarkMode === false ? "text-zinc-700" : "text-zinc-300"}`}>Compiling Grounded Synthesis...</span>
            </div>
            <span className={`text-xs font-mono px-2 py-0.5 rounded-full font-bold ${
              isDarkMode === false ? "bg-purple-50 text-purple-700" : "text-purple-300 bg-white/5"
            }`}>
              {searchPercentage}%
            </span>
          </div>

          {/* Progress bar container */}
          <div className={`w-full h-1.5 rounded-full overflow-hidden relative ${isDarkMode === false ? "bg-zinc-100" : "bg-white/10"}`}>
            <motion.div 
              id="search-progress-bar"
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${searchPercentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Log stream steps listings */}
          <div id="search-steps-list" className={`space-y-1.5 pl-1.5 border-l mt-2 font-mono text-[11px] select-none text-left ${
            isDarkMode === false ? "border-zinc-200" : "border-white/5"
          }`}>
            {searchSteps.map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-2 ${
                  idx === searchSteps.length - 1 
                    ? (isDarkMode === false ? "text-purple-700 font-bold" : "text-purple-300 font-bold") 
                    : "text-zinc-505 text-zinc-500"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block flex-shrink-0 animate-pulse"></span>
                <span>{step}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Errors Block */}
      {errorStatus && (
        <div id="search-error-block" className="p-4 rounded-xl bg-red-950/20 border border-red-500/10 text-red-300 flex items-start gap-4 text-left">
          <div className="p-2 bg-red-950/40 rounded-lg">
            <Info className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="text-xs font-semibold">Synthesis Error</p>
            <p className="text-xs mt-1 text-zinc-400">{errorStatus}</p>
            <button 
              id="retry-synthesis-btn"
              onClick={() => runSearch(activeSession ? activeSession.messages[activeSession.messages.length - 2]?.content || "" : "")} 
              className="mt-2 text-[10px] font-semibold text-purple-500 hover:text-purple-400 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Retry synthesis
            </button>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />

      {/* BOTTOM PERSISTENT SEARCH QUERY BOX (When thread active) */}
      {viewMode === "search" && (activeSession || isSearching) && (
        <div className={`fixed bottom-0 ${isCollapsed ? "md:left-[72px]" : "md:left-[256px]"} left-0 right-0 px-6 md:px-8 pb-4 pt-6 z-30 transition-all duration-300 ease-in-out ${
          isDarkMode === false 
            ? "bg-gradient-to-t from-[#fafafa] via-[#fafafa]/95 to-transparent" 
            : "bg-gradient-to-t from-[#05040a] via-[#05040a]/95 to-transparent"
        }`}>
          <div className="max-w-3xl mx-auto relative group z-10 p-[1.5px]">
            {isDarkMode !== false && (
              <div className={`absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-600 rounded-[24px] blur transition-all duration-500 ${
                isFocused ? "opacity-45 scale-[1.01]" : "opacity-25 group-hover:opacity-40"
              }`}></div>
            )}
            
            <div className={`relative border rounded-[22px] p-2.5 px-4 flex items-center gap-2.5 backdrop-blur-xl transition-all duration-300 ${
              isDarkMode === false
                ? `${isFocused ? "border-purple-400 shadow-lg shadow-purple-100 bg-white" : "bg-white border-zinc-200 shadow-md"}`
                : `${isFocused ? "border-purple-500/50 bg-[#101018]" : "bg-[#101018]/90 border-white/10"}`
            }`}>
              <div className={`px-2.5 py-1 rounded text-[10px] font-mono font-semibold select-none shrink-0 ${
                isDarkMode === false 
                  ? "bg-purple-105 bg-purple-100 text-purple-700 border border-purple-200" 
                  : "bg-white/5 border border-white/5 text-purple-400"
              }`}>
                SEARCH
              </div>

              <textarea
                id="active-followup-textarea"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={getPlaceholderText(activeMode)}
                className={`flex-1 bg-transparent border-0 outline-0 ring-0 focus:ring-0 text-xs resize-none py-1.5 max-h-24 overflow-y-auto outline-none transition-all ${
                  isDarkMode === false ? "text-zinc-800 placeholder-zinc-400" : "text-zinc-101 text-zinc-100 placeholder-zinc-505 placeholder-zinc-500"
                }`}
                rows={1}
              />

              {/* Dynamic OpenRouter Model Selector dropdown inside active thread follow-up box */}
              <div className="relative flex items-center shrink-0 select-none">
                <motion.span 
                  key={selectedModel}
                  initial={{ scale: 0.8, y: -2 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="absolute left-2.5 pointer-events-none"
                >
                  <Cpu className="w-3 h-3 text-purple-500" />
                </motion.span>
                <select
                  id="followup-model-selector"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className={`pl-6 pr-5 py-1 rounded text-[10px] font-mono font-bold outline-none transition-all cursor-pointer appearance-none border ${
                    isDarkMode === false
                      ? "bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-zinc-200"
                      : "bg-[#101018]/90 border-white/10 text-zinc-400 hover:bg-white/5"
                  }`}
                  style={{ WebkitAppearance: "none", MozAppearance: "none" }}
                >
                  {AVAILABLE_MODELS.map((model) => (
                    <option key={model.id} value={model.id} className={isDarkMode === false ? "bg-white text-zinc-800" : "bg-[#101018] text-zinc-100"}>
                      {model.label}
                    </option>
                  ))}
                </select>
                <span className="absolute right-1.5 pointer-events-none text-zinc-500">
                  <ChevronDown className="w-2.5 h-2.5" />
                </span>
              </div>

              {/* Focus/Search Mode Selector dropdown inside active thread follow-up box */}
              <div className="relative flex items-center shrink-0 select-none">
                <motion.span 
                  key={activeMode}
                  initial={{ scale: 0.8, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="absolute left-2.5 pointer-events-none"
                >
                  {React.createElement(ModeIconMap[activeMode] || Search, { className: "w-3 h-3 text-purple-500" })}
                </motion.span>
                <select
                  id="followup-mode-selector"
                  value={activeMode}
                  onChange={(e) => setActiveMode(e.target.value)}
                  className={`pl-6 pr-5 py-1 rounded text-[10px] font-mono font-bold outline-none transition-all cursor-pointer appearance-none border ${
                    isDarkMode === false
                      ? "bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-zinc-200"
                      : "bg-[#101018]/90 border-white/10 text-zinc-400 hover:bg-white/5"
                  }`}
                  style={{ WebkitAppearance: "none", MozAppearance: "none" }}
                >
                  {AVAILABLE_MODES.map((mode) => (
                    <option key={mode.id} value={mode.id} className={isDarkMode === false ? "bg-white text-zinc-800" : "bg-[#101018] text-zinc-100"}>
                      {mode.label}
                    </option>
                  ))}
                </select>
                <span className="absolute right-1.5 pointer-events-none text-zinc-500">
                  <ChevronDown className="w-2.5 h-2.5" />
                </span>
              </div>

              <motion.button
                id="submit-followup-btn"
                onClick={() => runSearch(query)}
                disabled={!query.trim() || isSearching}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-white/5 disabled:scale-100 flex items-center justify-center text-white cursor-pointer flex-shrink-0"
              >
                <ArrowUp className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
