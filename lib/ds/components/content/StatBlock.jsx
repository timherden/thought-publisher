"use client";

import React from "react";

export function StatBlock({ value, caption, source, accent = "mint", align = "left", size = "lg", style }) {
  const bar = { mint: "var(--teal-300)", amber: "var(--amber-500)", coral: "var(--coral-500)", ink: "var(--ink-900)" }[accent];
  return (
    <figure style={{ margin: 0, textAlign: align, maxWidth: 260, ...style }}>
      <div style={{ height: "var(--rule-width-heavy)", background: bar, marginBottom: "var(--space-sm)", width: size === "lg" ? 96 : 64, marginLeft: align === "right" ? "auto" : undefined, marginInline: align === "center" ? "auto" : undefined }} />
      <div style={{
        font: size === "lg" ? "var(--type-stat)" : "var(--weight-medium) var(--text-stat-s)/1 var(--font-display)",
        letterSpacing: "var(--tracking-display)", color: "var(--ink-900)",
      }}>{value}</div>
      {caption && <figcaption style={{ font: "var(--type-body-s)", color: "var(--text-secondary)", marginTop: "var(--space-xs)" }}>{caption}</figcaption>}
      {source && <div style={{ font: "var(--type-caption)", color: "var(--text-muted)", marginTop: "var(--space-2xs)" }}>{source}</div>}
    </figure>
  );
}
