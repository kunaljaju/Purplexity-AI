import React, { useState, useMemo } from "react";
import { Table, Copy, Check, Search, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const FormattedTable = ({
  headers,
  rows,
  isDarkMode,
  renderInline,
}) => {
  const [filterQuery, setFilterQuery] = useState("");
  const [sortConfig, setSortConfig] = useState(null);
  
  // Pagination helpers
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

  // Sorting logic
  const handleSort = (colIdx) => {
    let direction = "asc";
    if (sortConfig && sortConfig.colIdx === colIdx && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ colIdx, direction });
    setCurrentPage(1); // Reset page on sort
  };

  // Process rows (filter + sort)
  const processedRows = useMemo(() => {
    let result = [...rows];

    // 1. Filter rows
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      result = result.filter((row) =>
        row.some((cell) => cell.toLowerCase().includes(q))
      );
    }

    // 2. Sort rows
    if (sortConfig) {
      const { colIdx, direction } = sortConfig;
      result.sort((a, b) => {
        const valA = (a[colIdx] || "").trim();
        const valB = (b[colIdx] || "").trim();

        // Attempt numeric comparison
        const numA = parseFloat(valA.replace(/[^0-9.-]/g, ""));
        const numB = parseFloat(valB.replace(/[^0-9.-]/g, ""));

        if (!isNaN(numA) && !isNaN(numB)) {
          return direction === "asc" ? numA - numB : numB - numA;
        }

        // Fallback to alphabetical sorting
        return direction === "asc"
          ? valA.localeCompare(valB, undefined, { sensitivity: "base" })
          : valB.localeCompare(valA, undefined, { sensitivity: "base" });
      });
    }

    return result;
  }, [rows, filterQuery, sortConfig]);

  // Pagination logic
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return processedRows.slice(startIndex, startIndex + rowsPerPage);
  }, [processedRows, currentPage]);

  const totalPages = Math.max(1, Math.ceil(processedRows.length / rowsPerPage));

  // Copy table to Clipboard as CSV/TSV format
  const handleCopyTable = async () => {
    try {
      // Rebuild spreadsheet TSV (Perfect for Excel / Google Sheets copy-paste)
      const headerStr = headers.join("\t");
      const rowStrings = rows.map((r) => r.join("\t"));
      const finalClipString = [headerStr, ...rowStrings].join("\n");

      await navigator.clipboard.writeText(finalClipString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy table dataset to clipboard:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`my-5 border rounded-2xl overflow-hidden shadow-xl shadow-purple-950/5 flex flex-col ${
        isDarkMode === false
          ? "bg-white border-zinc-250 shadow-zinc-200/50"
          : "bg-zinc-900/10 border-white/5 backdrop-blur-md"
      }`}
    >
      {/* Table Header Controls toolbar */}
      <div className={`px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b ${
        isDarkMode === false ? "bg-zinc-550/5 bg-zinc-50 border-zinc-200" : "bg-purple-950/10 border-white/5"
      }`}>
        {/* Title widget */}
        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-300">
          <Table className="w-4 h-4" />
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-mono">
            {rows.length} {rows.length === 1 ? "Row" : "Rows"}
          </span>
        </div>

        {/* Toolbar Interactive Controls */}
        <div className="flex items-center gap-2.5">
          {/* Row interactive inline filter input */}
          <div className="relative flex items-center">
            <span className="absolute left-2.5 text-zinc-500">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => {
                setFilterQuery(e.target.value);
                setCurrentPage(1); // Reset page context
              }}
              placeholder="Search table rows..."
              className={`w-40 sm:w-48 pl-8 pr-2.5 py-1 text-xs rounded-xl border outline-none placeholder:text-zinc-500 transition-all ${
                isDarkMode === false
                  ? "bg-white border-zinc-200 text-zinc-900 focus:border-purple-300 focus:ring-1 focus:ring-purple-300"
                  : "bg-zinc-950/60 border-white/5 text-zinc-200 focus:border-purple-500/30"
              }`}
            />
          </div>

          {/* Copy Table dataset control */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleCopyTable}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isDarkMode === false
                ? "bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-purple-650 hover:text-purple-600 hover:border-purple-300 shadow-sm"
                : "bg-zinc-950/60 border border-white/5 text-zinc-300 hover:bg-purple-500/10 hover:text-purple-300 hover:border-purple-500/20"
            }`}
            title="Copy structured dataset to clipboard as TSV format (Excel/Google Sheets format)"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono">Export TSV</span>
          </motion.button>
        </div>
      </div>

      {/* Main Table Scrolling viewport wrapper */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y text-left border-collapse select-text">
          <thead className={isDarkMode === false ? "bg-zinc-100" : "bg-purple-950/20"}>
            <tr className={isDarkMode === false ? "divide-zinc-200" : "divide-white/5"}>
              {headers.map((h, colIdx) => {
                const isSorted = sortConfig?.colIdx === colIdx;
                return (
                  <th
                    key={colIdx}
                    onClick={() => handleSort(colIdx)}
                    className={`px-4 py-3 text-xs font-semibold tracking-wider font-display cursor-pointer hover:bg-purple-500/5 select-none transition-colors border-r last:border-r-0 ${
                      isDarkMode === false
                        ? "text-zinc-800 border-zinc-200/80"
                        : "text-purple-200 border-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span>{renderInline(h.trim())}</span>
                      <ArrowUpDown className={`w-3 h-3 transition-opacity ${
                        isSorted ? "text-purple-500 opacity-100" : "text-zinc-500 opacity-30 group-hover:opacity-100"
                      }`} />
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className={`divide-y ${
            isDarkMode === false ? "divide-zinc-200/60" : "divide-white/5"
          }`}>
            <AnimatePresence mode="popLayout">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={headers.length || 1} className="px-4 py-8 text-center text-xs text-zinc-500 font-mono">
                    No matching rows found in table compilation.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className={`hover:bg-purple-500/[0.02] transition-colors border-r last:border-r-0 ${
                      isDarkMode === false 
                        ? rowIdx % 2 === 0 ? "bg-white" : "bg-zinc-50/50"
                        : rowIdx % 2 === 0 ? "bg-transparent" : "bg-white/[0.01]"
                    }`}
                  >
                    {row.map((cell, cellIdx) => (
                      <td
                        key={cellIdx}
                        className={`px-4 py-2.5 text-sm leading-relaxed border-r last:border-r-0 max-w-sm overflow-hidden text-ellipsis ${
                          isDarkMode === false
                            ? "text-zinc-705 text-zinc-700 border-zinc-150/60"
                            : "text-zinc-300 border-white/5"
                        }`}
                      >
                        {renderInline(cell.trim())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Table Pagination footer controller */}
      {totalPages > 1 && (
        <div className={`px-4 py-2 flex items-center justify-between border-t ${
          isDarkMode === false ? "bg-zinc-50 border-zinc-200 text-zinc-600" : "bg-[#0c0b11] border-white/5 text-zinc-400"
        }`}>
          <span className="text-[10px] font-mono">
            Showing Page {currentPage} of {totalPages} ({processedRows.length} filtered entries)
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
              disabled={currentPage === 1}
              className={`p-1 rounded cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                isDarkMode === false ? "hover:bg-zinc-200/60" : "hover:bg-white/5"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
              disabled={currentPage === totalPages}
              className={`p-1 rounded cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                isDarkMode === false ? "hover:bg-zinc-200/60" : "hover:bg-white/5"
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
