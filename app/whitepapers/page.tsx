import Link from "next/link";
import { Card, Eyebrow, Icon, SectionHeading } from "@/lib/ds";
import { publishedPapers } from "@/lib/content";

export default function WhitepapersPage() {
  const papers = publishedPapers();

  return (
    <section style={{ maxWidth: 1160, margin: "0 auto", padding: "64px 32px 0" }}>
      <SectionHeading
        eyebrow="Library"
        band="mint"
        level={1}
        standfirst="Long-form guides as PDFs. Free, printable, and sourced — no email required."
      >
        Whitepapers
      </SectionHeading>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 28,
          marginTop: 48
        }}
      >
        {papers.map((paper) => (
          <Link key={paper.slug} href={`/whitepapers/${paper.slug}`}>
            <Card variant="hairline" padding="none" interactive style={{ height: "100%" }}>
              <div
                style={{
                  background: "var(--paper-cool)",
                  borderBottom: "1px solid var(--border-hairline)",
                  padding: 28,
                  aspectRatio: "4 / 3",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  gap: 12
                }}
              >
                <Eyebrow tone="muted">Whitepaper</Eyebrow>
                <span
                  style={{
                    font: "var(--type-h3)",
                    letterSpacing: "var(--tracking-heading)",
                    textWrap: "pretty"
                  }}
                >
                  {paper.title}
                </span>
                <div style={{ height: 9, width: 96, borderRadius: 999, background: "var(--amber-300)" }} />
              </div>
              <div
                style={{ padding: "24px 28px 28px", display: "flex", flexDirection: "column", gap: 14 }}
              >
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ font: "var(--font-mono)", fontSize: 12, color: "var(--ink-500)" }}>
                    {paper.pages} pages
                  </span>
                  <span style={{ font: "var(--font-mono)", fontSize: 12, color: "var(--ink-300)" }}>·</span>
                  <span style={{ font: "var(--font-mono)", fontSize: 12, color: "var(--ink-500)" }}>
                    {paper.date}
                  </span>
                </div>
                <p style={{ font: "var(--type-body-s)", color: "var(--ink-700)", margin: 0 }}>
                  {paper.summary}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                  <Icon name="download" size={16} color="var(--teal-700)" />
                  <span
                    style={{ font: "var(--type-ui)", letterSpacing: "0.04em", color: "var(--teal-700)" }}
                  >
                    Download PDF
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
