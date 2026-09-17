import type { Metadata } from "next";
import { Button, Eyebrow } from "@/lib/ds";

export const metadata: Metadata = { title: "About — Tim Herden" };

export default function AboutPage() {
  return (
    <section style={{ maxWidth: 1160, margin: "0 auto", padding: "64px 32px 0" }}>
      <div style={{ display: "flex", gap: 56, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 460px", minWidth: 0, maxWidth: "62ch" }}>
          <Eyebrow tone="muted">About</Eyebrow>
          <h1 style={{ font: "var(--type-h1)", letterSpacing: "var(--tracking-heading)", margin: "20px 0 0" }}>
            Tim Herden
          </h1>
          <p style={{ font: "var(--type-body-l)", color: "var(--ink-700)", margin: "24px 0 0" }}>
            I write about systems integration from the inside: what the work actually consists of, and why
            the difficult parts are rarely technical.
          </p>
          <p style={{ font: "var(--type-body)", color: "var(--ink-900)", margin: "24px 0 0" }}>
            Most of the integration work I have watched go wrong went wrong early, in the weeks when nobody
            felt they were doing anything risky. Two teams used the same nouns, agreed quickly, and
            discovered eighteen months later that they had meant different things. The essays and guides
            here are an attempt to make that failure mode boring and visible.
          </p>
          <p style={{ font: "var(--type-body)", color: "var(--ink-900)", margin: "24px 0 0" }}>
            Everything on this site is published in my own name and written in my own time. If you disagree
            with a piece, write to me — the corrections are usually more interesting than the original.
          </p>
          <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--border-hairline)" }}>
            <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">
              <Button variant="secondary" icon="link" iconPosition="left">
                LinkedIn
              </Button>
            </a>
          </div>
        </div>
        <div style={{ flex: "0 1 240px" }}>
          <div style={{ borderTop: "3px solid var(--teal-500)", paddingTop: 16 }}>
            <span style={{ font: "var(--type-caption)", color: "var(--ink-700)" }}>
              Written independently. Not endorsed by, or affiliated with, any employer.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
