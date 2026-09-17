"use client";

import React from "react";

export function FigureCaption({ label = "", children, source = "", style = {} }) {
  return (
    <div style={{ borderTop: "var(--rule-width) solid var(--border-hairline)", paddingTop: "var(--space-xs)", maxWidth: "var(--measure-narrow)", ...style }}>
      {label && <span style={{ font: "var(--type-eyebrow)", letterSpacing: "var(--tracking-eyebrow)", textTransform: "uppercase", color: "var(--teal-700)", marginRight: "var(--space-xs)" }}>{label}</span>}
      <span style={{ font: "var(--type-caption)", color: "var(--text-secondary)" }}>{children}</span>
      {source && <div style={{ font: "var(--type-caption)", color: "var(--text-muted)", marginTop: 2 }}>{source}</div>}
    </div>
  );
}
