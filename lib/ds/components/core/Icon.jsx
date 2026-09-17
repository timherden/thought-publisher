"use client";

import React from "react";
import * as icons from "lucide-react";

/* Lucide (stroke 1.5) is the brand's icon set. In Next we use the packaged React
   components rather than the CDN UMD build, so names are mapped kebab → Pascal. */
const pascal = (n) =>
  String(n || "")
    .split("-")
    .filter(Boolean)
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join("");

export function Icon({ name, size = 18, strokeWidth = 1.5, color = "currentColor", className = "", style = {} }) {
  const Cmp = icons[pascal(name)];
  const box = { display: "inline-flex", width: size, height: size, flex: "0 0 auto", ...style };
  if (!Cmp) return <span aria-hidden="true" className={className} style={box} />;
  return (
    <Cmp
      aria-hidden="true"
      className={className}
      size={size}
      strokeWidth={strokeWidth}
      color={color}
      style={{ flex: "0 0 auto", ...style }}
    />
  );
}
