"use client";

import React from "react";
import { Icon } from "./Icon.jsx";

const sizes = {
  sm: { height: "var(--control-height-sm)", padding: "0 14px", font: "var(--weight-medium) 13px/1 var(--font-ui)" },
  md: { height: "var(--control-height)", padding: "0 var(--control-padding-x)", font: "var(--weight-medium) 15px/1 var(--font-ui)" },
  lg: { height: "var(--control-height-lg)", padding: "0 26px", font: "var(--weight-medium) 16px/1 var(--font-ui)" },
};

const variants = {
  primary: { background: "var(--ink-900)", color: "var(--text-inverse)", border: "1px solid var(--ink-900)" },
  secondary: { background: "transparent", color: "var(--ink-900)", border: "1px solid var(--border-hairline-strong)" },
  accent: { background: "var(--teal-700)", color: "var(--text-inverse)", border: "1px solid var(--teal-700)" },
  ghost: { background: "transparent", color: "var(--text-primary)", border: "1px solid transparent" },
  link: { background: "transparent", color: "var(--text-link)", border: "1px solid transparent", padding: 0, height: "auto", textDecoration: "underline", textUnderlineOffset: "3px" },
};

const hovers = {
  primary: { background: "var(--ink-700)", borderColor: "var(--ink-700)" },
  secondary: { background: "var(--ink-050)", borderColor: "var(--ink-900)" },
  accent: { background: "var(--teal-500)", borderColor: "var(--teal-500)" },
  ghost: { background: "var(--ink-050)" },
  link: { color: "var(--text-link-hover)" },
};

export function Button({
  children, variant = "primary", size = "md", icon, iconPosition = "right",
  disabled = false, fullWidth = false, type = "button", onClick, style, ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "var(--space-xs)",
    borderRadius: "var(--radius-sm)", cursor: disabled ? "not-allowed" : "pointer",
    letterSpacing: "var(--tracking-wide)", whiteSpace: "nowrap", width: fullWidth ? "100%" : undefined,
    transition: "var(--transition-control), transform var(--duration-fast) var(--ease-out)",
    transform: press && !disabled ? "scale(var(--press-scale))" : "none",
    opacity: disabled ? 0.38 : 1,
    ...sizes[size], ...variants[variant],
    ...(hover && !disabled ? hovers[variant] : null),
    ...style,
  };
  return (
    <button
      type={type} disabled={disabled} onClick={disabled ? undefined : onClick} style={base}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)} onMouseUp={() => setPress(false)}
      {...rest}
    >
      {icon && iconPosition === "left" && <Icon name={icon} size={size === "sm" ? 15 : 17} />}
      <span>{children}</span>
      {icon && iconPosition === "right" && <Icon name={icon} size={size === "sm" ? 15 : 17} />}
    </button>
  );
}
