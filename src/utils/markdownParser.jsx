import React from "react";
import { FormattedTable } from "../components/FormattedTable";

export const cleanMathSymbols = (mathText) => {
  return mathText
    .replace(/\\times/g, "×")
    .replace(/\\max/g, "max")
    .replace(/\\min/g, "min")
    .replace(/\\leq?/g, "≤")
    .replace(/\\geq?/g, "≥")
    .replace(/\\neq/g, "≠")
    .replace(/\\approx/g, "≈")
    .replace(/\\in/g, "∈")
    .replace(/\\infty/g, "∞")
    .replace(/\\alpha/g, "α")
    .replace(/\\beta/g, "β")
    .replace(/\\gamma/g, "γ")
    .replace(/\\delta/g, "δ")
    .replace(/\\pi/g, "π")
    .replace(/\\sqrt/g, "√")
    .replace(/\\dots/g, "…")
    .replace(/\\sum/g, "∑");
};

// Helper to parse citations e.g. [1] or boldness **bold**
export const parseInlineStyles = (line, citations = [], isDarkMode = true) => {
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

  // Pass 4: Parse block LaTeX math $$equations$$
  finalParts = [];
  parts.forEach((p) => {
    if (p.type === "text") {
      const blockMathRegex = /\$\$([^\$]+)\$\$/g;
      let lastIdx = 0;
      let match;
      while ((match = blockMathRegex.exec(p.val)) !== null) {
        if (match.index > lastIdx) {
          finalParts.push({ type: "text", val: p.val.slice(lastIdx, match.index) });
        }
        finalParts.push({ type: "math", val: cleanMathSymbols(match[1]) });
        lastIdx = blockMathRegex.lastIndex;
      }
      if (lastIdx < p.val.length) {
        finalParts.push({ type: "text", val: p.val.slice(lastIdx) });
      }
    } else {
      finalParts.push(p);
    }
  });
  parts = finalParts;

  // Pass 5: Parse inline LaTeX math $equations$
  finalParts = [];
  parts.forEach((p) => {
    if (p.type === "text") {
      const inlineMathRegex = /\$([^\$]+)\$/g;
      let lastIdx = 0;
      let match;
      while ((match = inlineMathRegex.exec(p.val)) !== null) {
        if (match.index > lastIdx) {
          finalParts.push({ type: "text", val: p.val.slice(lastIdx, match.index) });
        }
        finalParts.push({ type: "math", val: cleanMathSymbols(match[1]) });
        lastIdx = inlineMathRegex.lastIndex;
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
      return (
        <strong key={index} className={isDarkMode === false ? "text-purple-800 font-bold" : "text-purple-300 font-semibold"}>
          {part.val}
        </strong>
      );
    }
    if (part.type === "code") {
      return (
        <code key={index} className={isDarkMode === false ? "px-1.5 py-0.5 rounded font-mono text-xs bg-purple-100 text-purple-800 border border-purple-200" : "px-1.5 py-0.5 rounded font-mono text-xs bg-purple-950/50 text-purple-300 border border-purple-800/20"}>
          {part.val}
        </code>
      );
    }
    if (part.type === "math") {
      return (
        <span 
          key={index} 
          className={isDarkMode === false ? "inline-block font-mono text-xs bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded italic font-semibold border border-purple-200" : "inline-block font-mono text-xs bg-purple-950/30 text-purple-300 px-1.5 py-0.5 rounded italic border border-purple-800/10"}
        >
          {part.val}
        </span>
      );
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

// Main entry point helper function to render formatted answer
export const renderFormattedAnswer = (text, citations = [], isDarkMode = true) => {
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
      bodyRows = currentTableRows.slice(2); // Skip dashed alignment line
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
        renderInline={(txt) => parseInlineStyles(txt, citations, isDarkMode)}
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
            {parseInlineStyles(hText, citations, isDarkMode)}
          </h3>
        );
      } else if (trimmed.startsWith("##")) {
        const hText = trimmed.replace(/^##\s*/, "");
        elements.push(
          <h2 key={i} className={`text-xl font-display font-semibold mt-6 mb-3 border-b pb-1 ${
            isDarkMode === false ? "text-zinc-900 border-zinc-200 font-bold" : "text-purple-100 border-purple-950/40"
          }`}>
            {parseInlineStyles(hText, citations, isDarkMode)}
          </h2>
        );
      } else if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        const listText = trimmed.replace(/^[-*]\s*/, "");
        elements.push(
          <li key={i} className={`ml-5 list-disc text-sm leading-relaxed my-1.5 pl-1 decoration-purple-500/50 ${
            isDarkMode === false ? "text-zinc-800" : "text-gray-300"
          }`}>
            {parseInlineStyles(listText, citations, isDarkMode)}
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
            <span className="flex-1">{parseInlineStyles(numText, citations, isDarkMode)}</span>
          </div>
        );
      } else if (trimmed === "") {
        elements.push(<div key={i} className="h-2"></div>);
      } else {
        elements.push(
          <p key={i} className={`text-sm leading-relaxed my-2 text-justify ${
            isDarkMode === false ? "text-zinc-800" : "text-gray-300"
          }`}>
            {parseInlineStyles(trimmed, citations, isDarkMode)}
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
