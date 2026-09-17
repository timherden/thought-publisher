"use client";

import React from "react";
import { Icon } from "../core/Icon.jsx";

const tones = {
  note: { surface: "var(--paper-cool)", line: "var(--border-hairline)", accent: "var(--ink-700)", icon: "info" },
  takeaway: { surface: "var(--teal-100)", line: "var(--teal-300)", accent: "var(--teal-700)", icon: "check" },
  caution: { surface: "var(--amber-100)", line: "var(--amber-300)", accent: "var(--amber-600)", icon: "alert-triangle" },
  counterpoint: { surface: "var(--coral-100)", line: "var(--coral-300)", accent: "var(--coral-600)", icon: "message-square" },
};

export function Callout({ title, children, tone = "note", icon, style }) {
  const t = tones[tone];
  return (
    <aside style={{
      background: t.surface, border: `1px solid ${t.line}`, borderRadius: "var(--radius-md)",
      padding: "var(--space-lg)", display: "flex", gap: "var(--space-md)", ...style,
    }}>
      <span style={{ color: t.accent, marginTop: 2 }}><Icon name={icon || t.icon} size={18} /></span>
      <div>
        {title && <div style={{ font: "var(--weight-semibold) var(--text-body)/1.3 var(--font-ui)", color: "var(--ink-900)", marginBottom: "var(--space-2xs)" }}>{title}</div>}
        <div style={{ font: "var(--type-body-s)", color: "var(--ink-700)" }}>{children}</div>
      </div>
    </aside>
  );
}
