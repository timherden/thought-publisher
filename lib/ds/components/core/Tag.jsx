"use client";

import React from "react";

const tones = {
  neutral: { background: "var(--ink-050)", color: "var(--ink-700)", border: "1px solid var(--border-hairline)" },
  teal: { background: "var(--teal-100)", color: "var(--teal-700)", border: "1px solid var(--teal-300)" },
  amber: { background: "var(--amber-100)", color: "var(--amber-600)", border: "1px solid var(--amber-300)" },
  coral: { background: "var(--coral-100)", color: "var(--coral-600)", border: "1px solid var(--coral-300)" },
  ink: { background: "var(--ink-900)", color: "var(--text-inverse)", border: "1px solid var(--ink-900)" },
  outline: { background: "transparent", color: "var(--ink-700)", border: "1px solid var(--border-hairline-strong)" },
};

export function Tag({ children, tone = "neutral", uppercase = true, style }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px",
      borderRadius: "var(--radius-pill)", font: "var(--weight-semibold) 11px/1 var(--font-ui)",
      letterSpacing: uppercase ? "var(--tracking-eyebrow)" : "var(--tracking-wide)",
      textTransform: uppercase ? "uppercase" : "none", ...tones[tone], ...style,
    }}>{children}</span>
  );
}
