"use client";

import React from "react";

/* Two brand-defining text treatments:
   - marker: a hand-drawn-feeling swash under one word (amber by default)
   - bar: a flat band of colour behind a heading, sitting on the baseline */
export function Highlight({ children, variant = "marker", color = "amber", script = false, style }) {
  const paint = { amber: "var(--highlight-amber)", mint: "var(--highlight-mint)", coral: "var(--highlight-coral)" }[color];
  const scriptStyle = script ? { fontFamily: "var(--font-script)", fontWeight: "var(--weight-bold)", fontSize: "1.18em", lineHeight: 0.9 } : null;
  if (variant === "bar") {
    return (
      <span style={{ background: paint, padding: "0 .14em", boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone", ...scriptStyle, ...style }}>
        {children}
      </span>
    );
  }
  return (
    <span style={{ position: "relative", display: "inline-block", ...scriptStyle, ...style }}>
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
      <span aria-hidden="true" style={{
        position: "absolute", left: "-.06em", right: "-.06em", bottom: ".02em",
        height: "var(--marker-height)", background: paint, borderRadius: "var(--radius-pill)", zIndex: 0,
      }} />
    </span>
  );
}
