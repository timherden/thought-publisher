"use client";

import React from "react";
import { Icon } from "./Icon.jsx";

const boxes = { sm: 32, md: 40, lg: 48 };

export function IconButton({ icon, label, size = "md", variant = "secondary", disabled = false, onClick, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const box = boxes[size];
  const tones = {
    secondary: { background: "transparent", border: "1px solid var(--border-hairline-strong)", color: "var(--ink-900)" },
    ghost: { background: "transparent", border: "1px solid transparent", color: "var(--text-secondary)" },
    filled: { background: "var(--ink-900)", border: "1px solid var(--ink-900)", color: "var(--text-inverse)" },
  };
  const hoverTones = {
    secondary: { background: "var(--ink-050)", borderColor: "var(--ink-900)" },
    ghost: { background: "var(--ink-050)", color: "var(--ink-900)" },
    filled: { background: "var(--ink-700)", borderColor: "var(--ink-700)" },
  };
  return (
    <button
      type="button" aria-label={label} title={label} disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        width: box, height: box, display: "inline-flex", alignItems: "center", justifyContent: "center",
        borderRadius: "var(--radius-sm)", cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.38 : 1, transition: "var(--transition-control)",
        ...tones[variant], ...(hover && !disabled ? hoverTones[variant] : null), ...style,
      }}
      {...rest}
    >
      <Icon name={icon} size={size === "sm" ? 16 : 18} />
    </button>
  );
}
