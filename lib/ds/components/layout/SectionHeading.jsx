"use client";

import React from "react";
import { Eyebrow } from "../content/Eyebrow.jsx";

export function SectionHeading({ eyebrow = "", children, standfirst = "", band = "mint", level = 2, align = "left", style = {} }) {
  const Tag = "h" + level;
  const paint = { mint: "var(--highlight-mint)", amber: "var(--highlight-amber)", coral: "var(--highlight-coral)", none: null }[band];
  return (
    <header style={{ maxWidth: "var(--measure)", textAlign: align, ...style }}>
      {eyebrow && <Eyebrow tone="muted" style={{ marginBottom: "var(--space-sm)" }}>{eyebrow}</Eyebrow>}
      {paint && <div aria-hidden="true" style={{ height: "var(--highlight-height)", background: paint, width: 132, marginBottom: -10, marginLeft: align === "center" ? "auto" : undefined, marginRight: align === "center" ? "auto" : undefined }} />}
      <Tag style={{ position: "relative", font: level === 1 ? "var(--type-h1)" : "var(--type-h2)", letterSpacing: "var(--tracking-heading)", color: "var(--ink-900)" }}>{children}</Tag>
      {standfirst && <p style={{ font: "var(--type-body-l)", color: "var(--text-secondary)", marginTop: "var(--space-md)" }}>{standfirst}</p>}
    </header>
  );
}
