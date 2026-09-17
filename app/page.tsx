import Link from "next/link";
import { Button, Card, Eyebrow, Highlight, SectionHeading, Tag, Icon } from "@/lib/ds";
import { PostRow } from "@/components/PostRow";
import {
  SERIES,
  pinnedPost,
  publishedPapers,
  publishedPosts,
  seriesWithCounts
} from "@/lib/content";
import { fmtDate, readingTime } from "@/lib/formatting";

const SHELL = { maxWidth: 1160, margin: "0 auto" } as const;

export default function HomePage() {
  const live = publishedPosts();
  const pinned = pinnedPost();
  const rest = live.filter((p) => p.slug !== pinned.slug).slice(0, 4);
  const papers = publishedPapers().slice(0, 3);
  const series = seriesWithCounts();
  const pinnedSeries = SERIES.find((s) => s.name === pinned.series);

  return (
    <>
      <section style={{ ...SHELL, padding: "88px 32px 64px" }}>
        <div style={{ maxWidth: 720 }}>
          <Eyebrow tone="muted">Independent writing on integration</Eyebrow>
          <h1
            style={{
              font: "var(--type-display-l)",
              letterSpacing: "var(--tracking-display)",
              margin: "20px 0 0",
              textWrap: "pretty"
            }}
          >
            Integration work that survives <Highlight script>contact</Highlight> with the business
          </h1>
          <p
            style={{
              font: "var(--type-body-l)",
              color: "var(--ink-700)",
              maxWidth: "62ch",
              margin: "24px 0 0"
            }}
          >
            Essays and long-form guides on the part of systems integration that no vendor demo covers:
            agreeing what the data means, writing it down, and holding the agreement once the project is
            over.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
            <Link href="/writing">
              <Button variant="primary" icon="arrow-right">
                Read the writing
              </Button>
            </Link>
            <Link href="/whitepapers">
              <Button variant="secondary" icon="download" iconPosition="left">
                Browse whitepapers
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section style={{ ...SHELL, padding: "0 32px" }}>
        <Eyebrow tone="muted" rule>
          Pinned
        </Eyebrow>
        <Link
          href={`/writing/${pinned.slug}`}
          style={{
            display: "flex",
            gap: 40,
            flexWrap: "wrap",
            alignItems: "flex-start",
            padding: "32px 0 40px",
            borderBottom: "1px solid var(--border-hairline)",
            color: "var(--ink-900)"
          }}
        >
          <div style={{ flex: "1 1 440px", minWidth: 0 }}>
            <div
              style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}
            >
              <Tag tone="teal">{pinned.tag}</Tag>
              <span style={{ font: "var(--type-caption)", color: "var(--ink-500)" }}>
                {fmtDate(pinned.date)} · {readingTime(pinned.body)} read
              </span>
            </div>
            <h2
              style={{
                font: "var(--type-h1)",
                letterSpacing: "var(--tracking-heading)",
                margin: 0,
                textWrap: "pretty"
              }}
            >
              {pinned.title}
            </h2>
            <p
              style={{
                font: "var(--type-body)",
                color: "var(--ink-700)",
                maxWidth: "62ch",
                margin: "16px 0 0"
              }}
            >
              {pinned.standfirst}
            </p>
            <div
              style={{
                marginTop: 20,
                font: "var(--type-ui)",
                letterSpacing: "0.04em",
                color: "var(--teal-700)"
              }}
            >
              Read the essay →
            </div>
          </div>
          <div style={{ flex: "0 1 240px" }}>
            <div style={{ borderTop: "3px solid var(--amber-500)", paddingTop: 16 }}>
              <Eyebrow tone="muted">{pinned.series}</Eyebrow>
              <span
                style={{
                  font: "var(--type-caption)",
                  color: "var(--ink-700)",
                  display: "block",
                  marginTop: 10
                }}
              >
                {pinnedSeries?.note}
              </span>
            </div>
          </div>
        </Link>
      </section>

      <section style={{ ...SHELL, padding: "64px 32px 0" }}>
        <SectionHeading
          eyebrow="Collections"
          band="mint"
          level={2}
          standfirst="Three running threads. Each one is written to be read in order, but none of it depends on that."
        >
          Series
        </SectionHeading>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 24,
            marginTop: 32
          }}
        >
          {series.map((s) => (
            <Link key={s.name} href={`/writing?series=${encodeURIComponent(s.name)}`}>
              <Card variant="hairline" padding="md" interactive style={{ height: "100%" }}>
                <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 12 }}>
                  <span
                    style={{
                      font: "var(--font-mono)",
                      fontSize: 12,
                      color: "var(--ink-500)",
                      letterSpacing: "0.04em"
                    }}
                  >
                    {s.count} essays
                  </span>
                  <h3
                    style={{ font: "var(--type-h3)", letterSpacing: "var(--tracking-heading)", margin: 0 }}
                  >
                    {s.name}
                  </h3>
                  <p style={{ font: "var(--type-body-s)", color: "var(--ink-700)", margin: 0 }}>{s.note}</p>
                  <div
                    style={{
                      marginTop: "auto",
                      paddingTop: 14,
                      borderTop: "1px solid var(--border-hairline)",
                      font: "var(--type-ui)",
                      letterSpacing: "0.04em",
                      color: "var(--teal-700)"
                    }}
                  >
                    Read the series →
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ ...SHELL, padding: "72px 32px 0" }}>
        <SectionHeading eyebrow="More writing" band="none" level={2}>
          Recent essays
        </SectionHeading>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 8 }}>
          {rest.map((p) => (
            <PostRow key={p.slug} post={p} />
          ))}
        </div>
        <div style={{ marginTop: 32 }}>
          <Link href="/writing">
            <Button variant="secondary" icon="arrow-right">
              All {live.length} essays
            </Button>
          </Link>
        </div>
      </section>

      <section style={{ ...SHELL, padding: "88px 32px 0" }}>
        <SectionHeading
          eyebrow="Long-form"
          band="none"
          level={2}
          standfirst="Deeper treatments as PDFs. Free, no email required."
        >
          Whitepapers
        </SectionHeading>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 24,
            marginTop: 32
          }}
        >
          {papers.map((paper) => (
            <Link key={paper.slug} href={`/whitepapers/${paper.slug}`}>
              <Card variant="hairline" padding="md" interactive accent="mint" style={{ height: "100%" }}>
                <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Icon name="file-text" size={16} color="var(--ink-500)" />
                    <span
                      style={{
                        font: "var(--font-mono)",
                        fontSize: 12,
                        color: "var(--ink-500)",
                        letterSpacing: "0.04em"
                      }}
                    >
                      {paper.pages} pages
                    </span>
                  </div>
                  <h3
                    style={{
                      font: "var(--type-h3)",
                      letterSpacing: "var(--tracking-heading)",
                      margin: 0,
                      textWrap: "pretty"
                    }}
                  >
                    {paper.title}
                  </h3>
                  <p style={{ font: "var(--type-body-s)", color: "var(--ink-700)", margin: 0 }}>
                    {paper.summary}
                  </p>
                  <div
                    style={{
                      marginTop: "auto",
                      paddingTop: 16,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      borderTop: "1px solid var(--border-hairline)"
                    }}
                  >
                    <Icon name="download" size={16} color="var(--teal-700)" />
                    <span
                      style={{
                        font: "var(--type-ui)",
                        letterSpacing: "0.04em",
                        color: "var(--teal-700)"
                      }}
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
    </>
  );
}
