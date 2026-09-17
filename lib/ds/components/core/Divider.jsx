"use client";

import React from "react";

export function Divider({ variant = "hairline", spacing = "lg", label, style }) {
  const gap = { none: 0, sm: "var(--space-sm)", md: "var(--space-md)", lg: "var(--space-lg)", xl: "var(--space-xl)" }[spacing];
  const lines = {
    hairline: { borderTop: "var(--rule-width) solid var(--border-hairline)" },
    strong: { borderTop: "var(--border-width-strong) solid var(--ink-900)" },
    accent: { borderTop: "var(--rule-width-heavy) solid var(--rule-accent)", width: 56 },
    amber: { borderTop: "var(--rule-width-heavy) solid var(--amber-500)", width: 56 },
  };
  if (label) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)", margin: `${gap} 0`, ...style }}>
        <span style={{ font: "var(--type-eyebrow)", letterSpacing: "var(--tracking-eyebrow)", textTransform: "uppercase", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{label}</span>
        <span style={{ flex: 1, ...lines.hairline }} />
      </div>
    );
  }
  return <div role="separator" style={{ margin: `${gap} 0`, ...lines[variant], ...style }} />;
}
