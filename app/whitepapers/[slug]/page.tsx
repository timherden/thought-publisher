import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Button, Card, Eyebrow, Icon } from "@/lib/ds";
import { PDF_BASE, paperBySlug, publishedPapers } from "@/lib/content";

export function generateStaticParams() {
  return publishedPapers().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const paper = paperBySlug(slug);
  if (!paper) return {};
  return { title: `${paper.title} — Tim Herden`, description: paper.summary };
}

export default async function PaperPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const paper = paperBySlug(slug);
  if (!paper || paper.status !== "published") notFound();

  const href = `${PDF_BASE}/${paper.slug}.pdf`;

  return (
    <section style={{ maxWidth: 1160, margin: "0 auto", padding: "40px 32px 0" }}>
      <Link
        href="/whitepapers"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          font: "var(--type-ui)",
          letterSpacing: "0.04em",
          color: "var(--ink-500)"
        }}
      >
        <Icon name="chevron-left" size={16} />
        All whitepapers
      </Link>

      <div style={{ display: "flex", gap: 56, flexWrap: "wrap", marginTop: 40 }}>
        <div style={{ flex: "1 1 420px", minWidth: 0 }}>
          <Eyebrow tone="muted">Whitepaper · {paper.pages} pages</Eyebrow>
          <h1
            style={{
              font: "var(--type-h1)",
              letterSpacing: "var(--tracking-heading)",
              margin: "20px 0 0",
              maxWidth: "24ch",
              textWrap: "pretty"
            }}
          >
            {paper.title}
          </h1>
          <p
            style={{
              font: "var(--type-body-l)",
              color: "var(--ink-700)",
              margin: "24px 0 0",
              maxWidth: "62ch"
            }}
          >
            {paper.summary}
          </p>

          <div style={{ marginTop: 40, paddingTop: 32, borderTop: "1px solid var(--border-hairline)" }}>
            <Eyebrow tone="ink">What is inside</Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", marginTop: 18 }}>
              {paper.contents.map((c) => (
                <div
                  key={c.num}
                  style={{
                    display: "flex",
                    gap: 20,
                    alignItems: "baseline",
                    padding: "14px 0",
                    borderBottom: "1px solid var(--border-hairline)"
                  }}
                >
                  <span style={{ flex: "0 0 28px", font: "var(--font-mono)", fontSize: 12, color: "var(--ink-300)" }}>
                    {c.num}
                  </span>
                  <span style={{ flex: "1 1 auto", font: "var(--type-body)", color: "var(--ink-900)" }}>
                    {c.label}
                  </span>
                  <span style={{ flex: "0 0 auto", font: "var(--font-mono)", fontSize: 12, color: "var(--ink-500)" }}>
                    {c.page}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p style={{ font: "var(--type-caption)", color: "var(--ink-500)", margin: "24px 0 0" }}>
            {paper.sourceLine}
          </p>
        </div>

        <div style={{ flex: "0 1 340px" }}>
          <Card variant="sunken" padding="lg" accent="amber">
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
              <Icon name="file-text" size={18} color="var(--ink-700)" />
              <span
                style={{
                  font: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--ink-700)",
                  letterSpacing: "0.04em"
                }}
              >
                PDF · {paper.pages} pages
              </span>
            </div>
            <h3 style={{ font: "var(--type-h3)", letterSpacing: "var(--tracking-heading)", margin: "0 0 10px" }}>
              Free to download
            </h3>
            <p style={{ font: "var(--type-body-s)", color: "var(--ink-700)", margin: "0 0 20px" }}>
              No email, no form. Print it, quote it, pass it on.
            </p>
            <a href={href} download>
              <Button variant="accent" fullWidth icon="download" iconPosition="left">
                Download PDF
              </Button>
            </a>
            <p style={{ font: "var(--font-mono)", fontSize: 12, color: "var(--ink-500)", margin: "14px 0 0" }}>
              {href}
            </p>
          </Card>

          {paper.relatedSlug && (
            <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--border-hairline)" }}>
              <Eyebrow tone="muted">Related essay</Eyebrow>
              <div style={{ marginTop: 14 }}>
                <Link href={`/writing/${paper.relatedSlug}`} style={{ font: "var(--type-body)" }}>
                  {paper.relatedTitle} →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
