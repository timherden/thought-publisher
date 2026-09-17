import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Button, Card, Eyebrow, Icon } from "@/lib/ds";
import { paperBySlug, publishedPapers } from "@/lib/papers";
import { fmtDate } from "@/lib/formatting";
import { PaperCover } from "@/components/PaperCard";

export async function generateStaticParams() {
  return (await publishedPapers()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const paper = await paperBySlug(slug);
  if (!paper) return {};
  return {
    title: `${paper.title} — Tim Herden`,
    description: paper.summary,
    openGraph: { images: paper.cover ? [paper.cover] : [] }
  };
}

export default async function PaperPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const paper = await paperBySlug(slug);
  if (!paper || paper.status !== "published") notFound();

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
          <Eyebrow tone="muted">
            Whitepaper · {paper.pages} {paper.pages === 1 ? "page" : "pages"}
          </Eyebrow>
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

          {paper.summary && (
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
          )}

          <p style={{ font: "var(--type-caption)", color: "var(--ink-500)", margin: "24px 0 0" }}>
            Published {fmtDate(paper.date)}
          </p>

          <div style={{ maxWidth: 520, marginTop: 40 }}>
            <Card variant="hairline" padding="none" style={{ overflow: "hidden" }}>
              <PaperCover paper={paper} />
            </Card>
            <p style={{ font: "var(--type-caption)", color: "var(--ink-500)", margin: "12px 0 0" }}>
              First page.
            </p>
          </div>
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
                PDF · {paper.pages} {paper.pages === 1 ? "page" : "pages"}
              </span>
            </div>
            <h3 style={{ font: "var(--type-h3)", letterSpacing: "var(--tracking-heading)", margin: "0 0 10px" }}>
              Free to download
            </h3>
            <p style={{ font: "var(--type-body-s)", color: "var(--ink-700)", margin: "0 0 20px" }}>
              No email, no form. Print it, quote it, pass it on.
            </p>
            <a href={paper.pdfUrl} target="_blank" rel="noreferrer">
              <Button variant="accent" fullWidth icon="download" iconPosition="left">
                Download PDF
              </Button>
            </a>
          </Card>
        </div>
      </div>
    </section>
  );
}
