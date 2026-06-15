import React from "react";

export const PurplexityLogo = ({
  className = "",
  size = 32,
}) => {
  return (
    <svg
      id="perplexity-swoosh-logo"
      width={size}
      height={size}
      viewBox="0 0 130 190"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} select-none`}
    >
      <defs>
        {/* Top Swoosh Gradient - Styled with premium vibrant purples */}
        <linearGradient id="topSwooshGrad" x1="12" y1="15" x2="115" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c084fc" /> {/* light purple */}
          <stop offset="60%" stopColor="#a855f7" /> {/* medium purple */}
          <stop offset="100%" stopColor="#7e22ce" /> {/* deep purple */}
        </linearGradient>

        {/* Bottom Swoosh Gradient - Styled with deep/royal purples to match */}
        <linearGradient id="bottomSwooshGrad" x1="10" y1="90" x2="115" y2="165" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6b21a8" /> {/* deep royal purple */}
          <stop offset="50%" stopColor="#4c1d95" /> {/* darker purple-indigo */}
          <stop offset="100%" stopColor="#3b0764" /> {/* deepest purple */}
        </linearGradient>

        {/* Subtle drop shadow effect for rendering depth */}
        <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#7c3aed" floodOpacity="0.15" />
        </filter>
      </defs>

      <g filter="url(#logoShadow)">
        {/* TOP SWOOSH (Vibrant purple wave loop) */}
        <path
          d="M 12 17 
             C 45 17, 85 10, 110, 30 
             C 125 42, 120 70, 105 85 
             C 95 95, 85 98, 78 101 
             C 85 91, 95 75, 90 60 
             C 82 46, 55 42, 12 42 
             Z"
          fill="url(#topSwooshGrad)"
        />

        {/* BOTTOM SWOOSH (Deep purple stem wave) */}
        <path
          d="M 12 115 
             L 12 165 
             C 12 173, 21 173, 44 173 
             L 44 125 
             C 55 110, 75 110, 95 110 
             C 112 110, 115 95, 115 80 
             C 115 75, 114 65, 111 55 
             C 107 72, 95 85, 78 92 
             C 60 100, 35 100, 12 115 
             Z"
          fill="url(#bottomSwooshGrad)"
        />
      </g>
    </svg>
  );
};
