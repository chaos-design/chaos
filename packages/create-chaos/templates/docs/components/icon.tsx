"use client";

import { useState } from "react";

export function Icon({ className }: { className?: string }) {
  const [isCovering, setIsCovering] = useState(false);
  return (
    <svg
      className={className}
      onMouseEnter={() => setIsCovering(true)}
      onMouseLeave={() => setIsCovering(false)}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id="faceClip">
          <circle cx="60" cy="72" r="26" />
        </clipPath>
      </defs>
      <circle cx="60" cy="64" r="40" fill="#C7A27C" />
      <circle cx="28" cy="44" r="16" fill="#B38A63" />
      <circle cx="92" cy="44" r="16" fill="#B38A63" />
      <circle cx="28" cy="44" r="9" fill="#F4E7D8" />
      <circle cx="92" cy="44" r="9" fill="#F4E7D8" />
      <circle cx="60" cy="72" r="26" fill="#F9F2E8" />
      <g clipPath="url(#faceClip)">
        <rect x="32" y="52" width="56" height="30" rx="15" fill="#F3E1CE" />
        <rect x="32" y="56" width="56" height="22" rx="11" fill="#FAF5EF" />
        <circle cx="48" cy="66" r="5" fill="#2E2A25" />
        <circle cx="72" cy="66" r="5" fill="#2E2A25" />
        <circle cx="60" cy="76" r="4.5" fill="#6B4A2F" />
        <path
          d="M50 80 Q60 88 70 80"
          stroke="#6B4A2F"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="38" cy="70" r="4" fill="#F6C3B5" />
        <circle cx="82" cy="70" r="4" fill="#F6C3B5" />
        <g
          style={{
            opacity: isCovering ? 1 : 0,
            transition: "opacity 180ms ease",
          }}
        >
          <circle cx="44" cy="66" r="10" fill="#B38A63" />
          <circle cx="76" cy="66" r="10" fill="#B38A63" />
          <circle cx="44" cy="66" r="6" fill="#F4E7D8" />
          <circle cx="76" cy="66" r="6" fill="#F4E7D8" />
        </g>
      </g>
      <rect x="40" y="90" width="40" height="14" rx="6" fill="#37B27B" />
      <circle cx="60" cy="97" r="4" fill="#F9F2E8" />
    </svg>
  );
}
