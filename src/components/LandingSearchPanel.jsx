import React, { useState } from "react";
import { Search, Sparkles, BookOpen, PenTool, Globe, Plus, ArrowUp, Cpu, ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { PurplexityLogo } from "./PurplexityLogo";

const AVAILABLE_MODELS = [
  { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { id: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { id: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
  { id: "openai/gpt-4o", label: "GPT-4o" },
  { id: "openai/gpt-4o-mini", label: "GPT-4o mini" },
  { id: "meta-llama/llama-3.3-70b-instruct", label: "Llama 3.3 70B" },
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

const QUICK_PROMPTS = [
  {
    icon: <Sparkles className="w-4 h-4 text-purple-400" />,
    label: "LLM capabilities comparison",
    prompt: "Compare the maximum context windows, architectural strengths, release specs, and target use cases of Gemini 2.5 Pro, Claude 3.5 Sonnet, and GPT-4o in an explicit markdown table.",
    mode: "copilot"
  },
  {
    icon: <Globe className="w-4 h-4 text-purple-400" />,
    label: "Future of fusion reactors",
    prompt: "Explain the current state of commercial nuclear fusion experiments, key milestones, and timeline forecasts.",
    mode: "standard"
  },
  {
    icon: <BookOpen className="w-4 h-4 text-purple-400" />,
    label: "Quantum teleportation specs",
    prompt: "Summarize the experimental status of quantum teleportation and quantum state transfer research today.",
    mode: "academic"
  },
  {
    icon: <PenTool className="w-4 h-4 text-purple-400" />,
    label: "Dystopian sci-fi scenario",
    prompt: "Draft an immersive, details-rich introductory scene for a sci-fi dystopian thriller centered around deep cognitive networks.",
    mode: "writing"
  }
];

export const LandingSearchPanel = ({
  query,
  setQuery,
  activeMode,
  setActiveMode,
  isSearching,
  runSearch,
  handleKeyDown,
  searchInputRef,
  selectedModel,
  setSelectedModel,
  isDarkMode = true,
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
        return "Ask anything...";
    }
  };
  return (
    <motion.div
      id="landing-panel"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="flex-grow flex flex-col justify-center items-center py-10"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-10 flex flex-col items-center gap-4 select-none text-center"
      >
        <div className="p-4 rounded-[28px] bg-purple-500/5 border border-purple-500/10 flex items-center justify-center shadow-lg shadow-purple-500/5">
          <PurplexityLogo size={70} className="text-purple-500 drop-shadow-md" />
        </div>
        <h1 className={`text-4xl font-extrabold tracking-tight md:text-5xl font-sans bg-clip-text text-transparent bg-gradient-to-r ${
          isDarkMode === false 
            ? "from-purple-700 via-indigo-600 to-purple-800" 
            : "from-white via-white/95 to-purple-200"
        }`}>
          Purplexity
        </h1>
      </motion.div>

      {/* Liquid Glass Search Bar Container */}
      <div className="w-full max-w-3xl relative group z-10 p-[1px]">
        {isDarkMode !== false && (
          <div className={`absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-600 rounded-[24px] blur transition-all duration-500 ${
            isFocused ? "opacity-55 scale-[1.01]" : "opacity-30 group-hover:opacity-45"
          }`}></div>
        )}
        
        <div id="landing-search-card" className={`relative border rounded-[22px] shadow-2xl p-4 flex flex-col gap-3 backdrop-blur-xl transition-all duration-300 ${
          isDarkMode === false 
            ? `${isFocused ? "border-purple-400 shadow-lg shadow-purple-100 bg-white" : "border-zinc-200/80 shadow-zinc-200/50 bg-white"}` 
            : `${isFocused ? "border-purple-500/50 bg-[#101018]" : "border-white/15 bg-[#101018]/80"}`
        }`}>
          
          <textarea 
            ref={searchInputRef}
            id="landing-search-textarea"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`w-full bg-transparent border-none focus:ring-0 outline-none resize-none h-14 pt-2 text-lg ${
              isDarkMode === false ? "text-zinc-900 placeholder-zinc-400" : "text-zinc-101 text-zinc-100 placeholder-zinc-500"
            }`}
            placeholder={getPlaceholderText(activeMode)}
          />
          
          <div className={`flex flex-row items-center justify-between gap-3 mt-2 pt-2 border-t ${isDarkMode === false ? "border-zinc-100" : "border-white/5"}`}>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center select-none">
              <button 
                id="landing-attach-files-btn"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-colors cursor-pointer ${
                  isDarkMode === false 
                    ? "bg-zinc-100 border-zinc-200 hover:bg-zinc-200 text-zinc-600"
                    : "bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10"
                }`}
              >
                <Plus className="w-3.5 h-3.5 text-purple-400" />
                Attach
              </button>

              {/* Dynamic OpenRouter Model Selector dropdown inside input box */}
              <div className="relative flex items-center">
                <motion.span 
                  key={selectedModel}
                  initial={{ scale: 0.8, y: -2 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="absolute left-3 pointer-events-none"
                >
                  <Cpu className="w-3.5 h-3.5 text-purple-500" />
                </motion.span>
                <select
                  id="model-selector"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className={`pl-8 pr-7 py-1.5 rounded-full text-xs font-mono font-medium outline-none transition-all cursor-pointer appearance-none border ${
                    isDarkMode === false
                      ? "bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-zinc-200"
                      : "bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10"
                  }`}
                  style={{ WebkitAppearance: "none", MozAppearance: "none" }}
                >
                  {AVAILABLE_MODELS.map((model) => (
                    <option key={model.id} value={model.id} className={isDarkMode === false ? "bg-white text-zinc-800" : "bg-[#101018] text-zinc-100"}>
                      {model.label}
                    </option>
                  ))}
                </select>
                <span className="absolute right-2.5 pointer-events-none text-zinc-500">
                  <ChevronDown className="w-3 h-3" />
                </span>
              </div>

              {/* Search/Focus Mode Selector dropdown inside input box */}
              <div className="relative flex items-center select-none">
                <motion.span 
                  key={activeMode}
                  initial={{ scale: 0.8, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="absolute left-3 pointer-events-none"
                >
                  {React.createElement(ModeIconMap[activeMode] || Search, { className: "w-3.5 h-3.5 text-purple-500" })}
                </motion.span>
                <select
                  id="mode-selector"
                  value={activeMode}
                  onChange={(e) => setActiveMode(e.target.value)}
                  className={`pl-8 pr-7 py-1.5 rounded-full text-xs font-mono font-medium outline-none transition-all cursor-pointer appearance-none border ${
                    isDarkMode === false
                      ? "bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-zinc-200"
                      : "bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10"
                  }`}
                  style={{ WebkitAppearance: "none", MozAppearance: "none" }}
                >
                  {AVAILABLE_MODES.map((mode) => (
                    <option key={mode.id} value={mode.id} className={isDarkMode === false ? "bg-white text-zinc-800" : "bg-[#101018] text-zinc-100"}>
                      {mode.label}
                    </option>
                  ))}
                </select>
                <span className="absolute right-2.5 pointer-events-none text-zinc-500">
                  <ChevronDown className="w-3 h-3" />
                </span>
              </div>
            </div>
            
            <motion.button 
              id="landing-submit-search-btn"
              onClick={() => runSearch(query)}
              disabled={!query.trim() || isSearching}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-950/20 disabled:text-purple-500/50 rounded-full flex items-center justify-center text-white cursor-pointer shrink-0"
              title="Submit question"
            >
              <ArrowUp className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Quick Prompts Bento-Carousel suggested tags */}
      <div className="w-full max-w-3xl mt-12">
        <div className={`text-center text-xs uppercase tracking-widest font-mono select-none mb-4 ${
          isDarkMode === false ? "text-zinc-500" : "text-zinc-550 text-zinc-500"
        }`}>Or try quick research threads</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {QUICK_PROMPTS.map((qp, idx) => (
            <motion.div
              id={`suggested-quick-prompt-${idx}`}
              key={idx}
              onClick={() => {
                setQuery(qp.prompt);
                setActiveMode(qp.mode);
                runSearch(qp.prompt, qp.mode);
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`p-3 border rounded-xl text-left cursor-pointer transition-all flex items-start gap-2.5 group select-none ${
                isDarkMode === false
                  ? "bg-white/80 border-zinc-205 border-zinc-200 hover:bg-purple-50/50 hover:border-purple-300 shadow-sm"
                  : "bg-zinc-900/40 hover:bg-purple-950/10 border border-white/5 hover:border-purple-500/20"
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-colors ${
                isDarkMode === false ? "bg-zinc-100 group-hover:bg-purple-100" : "bg-white/5 group-hover:bg-purple-600/10"
              }`}>
                {qp.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-semibold transition-colors ${
                  isDarkMode === false ? "text-zinc-800 group-hover:text-purple-705 group-hover:text-purple-700 font-sans" : "text-zinc-300 group-hover:text-purple-300"
                }`}>{qp.label}</div>
                <div className={`text-[10px] truncate mt-0.5 ${
                  isDarkMode === false ? "text-zinc-500" : "text-zinc-500"
                }`}>{qp.prompt}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
