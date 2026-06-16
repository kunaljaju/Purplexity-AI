import React from "react";
import { Menu, Sun, Moon } from "lucide-react";

export function Header({
  isDarkMode,
  setIsDarkMode,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  viewMode,
  setViewMode,
  setDashboardFilterMode,
  handleNewSearch,
  authUser
}) {
  return (
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
                : (isDarkMode === false ? "text-zinc-400 hover:text-zinc-700" : "text-zinc-500 hover:text-zinc-355")
            }`}
          >
            Research
          </button>
          <button 
            onClick={() => {
              setViewMode("dashboard");
              if (setDashboardFilterMode) {
                setDashboardFilterMode("all");
              }
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
  );
}
