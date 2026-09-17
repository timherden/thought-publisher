"use client";

import React from "react";

export function PullQuote({ children, attribution, role, accent = "mint", style }) {
  const bar = { mint: "var(--teal-300)", amber: "var(--amber-300)", coral: "var(--coral-300)" }[accent];
  return (
    <blockquote style={{ margin: 0, paddingLeft: "var(--space-lg)", borderLeft: `3px solid ${bar}`, maxWidth: "var(--measure-narrow)", ...style }}>
      <p style={{ font: "var(--weight-light) var(--text-h3)/1.42 var(--font-display)", letterSpacing: "var(--tracking-heading)", color: "var(--ink-900)" }}>
        {children}
      </p>
      {attribution && (
        <footer style={{ marginTop: "var(--space-md)", font: "var(--type-body-s)", color: "var(--text-secondary)" }}>
          <span style={{ font: "var(--type-eyebrow)", letterSpacing: "var(--tracking-eyebrow)", textTransform: "uppercase", color: "var(--ink-900)" }}>{attribution}</span>
          {role && <span style={{ marginLeft: "var(--space-xs)" }}>{role}</span>}
        </footer>
      )}
    </blockquote>
  );
}
