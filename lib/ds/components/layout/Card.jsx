"use client";

import React from "react";

export function Card({ children, variant = "hairline", padding = "lg", interactive = false, accent = "", onClick = (/** @type {any} */ _e) => {}, style = {} }) {
  const [hover, setHover] = React.useState(false);
  const pad = { none: 0, sm: "var(--space-md)", md: "var(--space-lg)", lg: "var(--space-xl)" }[padding];
  const variants = {
    hairline: { background: "var(--surface-card)", border: "1px solid var(--border-hairline)", boxShadow: "none" },
    sunken: { background: "var(--surface-sunken)", border: "1px solid transparent", boxShadow: "none" },
    raised: { background: "var(--surface-card)", border: "1px solid var(--border-hairline)", boxShadow: "var(--shadow-2)" },
    page: { background: "var(--paper)", border: "1px solid var(--border-hairline)", boxShadow: "var(--shadow-page)" },
  };
  const accents = { mint: "var(--teal-500)", amber: "var(--amber-500)", coral: "var(--coral-500)", ink: "var(--ink-900)" };
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: "var(--radius-lg)", padding: pad, position: "relative", overflow: "hidden",
        cursor: interactive ? "pointer" : undefined,
        transition: "box-shadow var(--duration-base) var(--ease-out), border-color var(--duration-base) var(--ease-out), transform var(--duration-base) var(--ease-out)",
        ...variants[variant],
        ...(interactive && hover ? { borderColor: "var(--border-hairline-strong)", boxShadow: "var(--shadow-2)", transform: "translateY(-1px)" } : null),
        ...style,
      }}
    >
      {accent && <span aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, right: 0, height: "var(--rule-width-heavy)", background: accents[accent] }} />}
      {children}
    </div>
  );
}
