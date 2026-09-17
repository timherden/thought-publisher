"use client";

import React from "react";
import { Icon } from "../core/Icon.jsx";

export function Checkbox({ label, description, checked = false, onChange, disabled = false, id, style }) {
  const boxId = id || React.useId();
  return (
    <label htmlFor={boxId} style={{ display: "flex", gap: "var(--space-sm)", alignItems: "flex-start", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1, ...style }}>
      <input id={boxId} type="checkbox" checked={checked} disabled={disabled} onChange={onChange} style={{ position: "absolute", opacity: 0, width: 1, height: 1 }} />
      <span style={{
        width: 18, height: 18, flex: "0 0 auto", marginTop: 1, borderRadius: "var(--radius-sm)",
        border: `1px solid ${checked ? "var(--ink-900)" : "var(--border-hairline-strong)"}`,
        background: checked ? "var(--ink-900)" : "var(--paper)", color: "var(--text-inverse)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        transition: "var(--transition-control)",
      }}>
        {checked && <Icon name="check" size={13} strokeWidth={2.4} />}
      </span>
      <span>
        <span style={{ font: "var(--type-body-s)", color: "var(--ink-900)" }}>{label}</span>
        {description && <span style={{ display: "block", font: "var(--type-caption)", color: "var(--text-muted)" }}>{description}</span>}
      </span>
    </label>
  );
}
