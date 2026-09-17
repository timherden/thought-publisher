import React from "react";
import { PullQuote, Callout } from "@/lib/ds";
import type { Block } from "@/lib/content";

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        if (b.type === "h2") {
          return (
            <h2
              key={i}
              style={{
                font: "var(--type-h2)",
                letterSpacing: "var(--tracking-heading)",
                margin: "48px 0 16px"
              }}
            >
              {b.text}
            </h2>
          );
        }
        if (b.type === "quote") {
          return (
            <div key={i} style={{ margin: "0 0 32px" }}>
              <PullQuote accent="amber">{b.text}</PullQuote>
            </div>
          );
        }
        if (b.type === "callout") {
          return (
            <div key={i} style={{ margin: "0 0 32px" }}>
              <Callout tone="takeaway" title={b.title}>
                {b.text}
              </Callout>
            </div>
          );
        }
        if (b.type === "list") {
          return (
            <div
              key={i}
              style={{ display: "flex", flexDirection: "column", gap: 12, margin: "0 0 32px" }}
            >
              {b.items.map((li, j) => (
                <div key={j} style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                  <span
                    style={{
                      flex: "0 0 auto",
                      width: 6,
                      height: 6,
                      borderRadius: 999,
                      background: "var(--teal-500)",
                      transform: "translateY(-3px)"
                    }}
                  />
                  <span style={{ font: "var(--type-body)", color: "var(--ink-900)" }}>{li.text}</span>
                </div>
              ))}
            </div>
          );
        }
        return (
          <p key={i} style={{ font: "var(--type-body)", color: "var(--ink-900)", margin: "0 0 24px" }}>
            {b.text}
          </p>
        );
      })}
    </>
  );
}
