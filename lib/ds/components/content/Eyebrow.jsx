"use client";

import React from "react";

export function Eyebrow({ children, tone = "ink", rule = false, style }) {
  const colors = { ink: "var(--ink-900)", muted: "var(--text-muted)", teal: "var(--teal-700)", amber: "var(--amber-600)", inverse: "var(--text-inverse)" };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", ...style }}>
      <span style={{
        font: "var(--type-eyebrow)", letterSpacing: "var(--tracking-eyebrow)",
        textTransform: "uppercase", color: colors[tone],
      }}>{children}</span>
      {rule && <span style={{ flex: 1, borderTop: "var(--rule-width) solid var(--border-hairline)" }} />}
    </div>
  );
}
