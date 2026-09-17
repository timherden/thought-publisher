"use client";

import React from "react";

export function Input({ label, hint, error, value, onChange, placeholder, type = "text", size = "md", disabled = false, id, style }) {
  const [focus, setFocus] = React.useState(false);
  const inputId = id || React.useId();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)", ...style }}>
      {label && <label htmlFor={inputId} style={{ font: "var(--weight-medium) var(--text-body-s)/1 var(--font-ui)", color: "var(--ink-900)" }}>{label}</label>}
      <input
        id={inputId} type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          height: size === "sm" ? "var(--control-height-sm)" : "var(--control-height)",
          padding: "0 12px", borderRadius: "var(--radius-sm)",
          border: `1px solid ${error ? "var(--coral-500)" : focus ? "var(--teal-500)" : "var(--border-hairline-strong)"}`,
          outline: focus ? "1px solid var(--teal-500)" : "none",
          background: disabled ? "var(--ink-050)" : "var(--paper)",
          font: "var(--type-body-s)", color: "var(--ink-900)", width: "100%", boxSizing: "border-box",
          transition: "var(--transition-control)",
        }}
      />
      {(error || hint) && <span style={{ font: "var(--type-caption)", color: error ? "var(--coral-600)" : "var(--text-muted)" }}>{error || hint}</span>}
    </div>
  );
}
