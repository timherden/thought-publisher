import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Button, Eyebrow, Icon, Tag } from "@/lib/ds";
import { Blocks } from "@/lib/blocks";
import {
  fmtDate,
  mdToBlocks,
  paperBySlug,
  postBySlug,
  publishedPosts,
  readingTime,
  siblings,
  toc
} from "@/lib/content";

export function generateStaticParams() {
  return publishedPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = postBySlug(slug);
  if (!post) return {};
  return { title: `${post.title} — Tim Herden`, description: post.standfirst };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = postBySlug(slug);
  if (!post || post.status !== "published") notFound();

  const blocks = mdToBlocks(post.body);
  const headings = toc(post.body);
  const related = post.paperSlug ? paperBySlug(post.paperSlug) : undefined;
  const more = siblings(post);

  return (
    <article style={{ maxWidth: 1160, margin: "0 auto", padding: "40px 32px 0" }}>
      <Link
        href="/writing"
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
        All writing
      </Link>

      <header style={{ margin: "40px 0 0", maxWidth: "62ch" }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
          <Tag tone="teal">{post.tag}</Tag>
          <span style={{ font: "var(--type-caption)", color: "var(--ink-500)" }}>
            {fmtDate(post.date)} · {readingTime(post.body)} read
          </span>
        </div>
        <h1
          style={{
            font: "var(--type-h1)",
            letterSpacing: "var(--tracking-heading)",
            margin: 0,
            textWrap: "pretty"
          }}
        >
          {post.title}
        </h1>
        <p style={{ font: "var(--type-body-l)", color: "var(--ink-700)", margin: "20px 0 0" }}>
          {post.standfirst}
        </p>
      </header>

      <div
        style={{
          display: "flex",
          gap: 48,
          flexWrap: "wrap",
          marginTop: 48,
          paddingTop: 40,
          borderTop: "1px solid var(--border-hairline)"
        }}
      >
        <div style={{ flex: "1 1 460px", minWidth: 0, maxWidth: "62ch" }}>
          <Blocks blocks={blocks} />

          <div style={{ margin: "56px 0 0", paddingTop: 24, borderTop: "1px solid var(--border-hairline)" }}>
            <span style={{ font: "var(--type-caption)", color: "var(--ink-500)" }}>{post.sourceLine}</span>
          </div>

          {more.length > 0 && (
            <div style={{ marginTop: 56 }}>
              <Eyebrow tone="muted" rule>
                More in {post.series}
              </Eyebrow>
              <div style={{ display: "flex", flexDirection: "column", marginTop: 8 }}>
                {more.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/writing/${s.slug}`}
                    style={{
                      display: "flex",
                      gap: 20,
                      alignItems: "baseline",
                      padding: "18px 0",
                      borderBottom: "1px solid var(--border-hairline)",
                      color: "var(--ink-900)"
                    }}
                  >
                    <span style={{ font: "var(--font-mono)", fontSize: 12, color: "var(--ink-300)" }}>
                      {fmtDate(s.date)}
                    </span>
                    <span style={{ font: "var(--type-body)" }}>{s.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside style={{ flex: "0 1 188px" }}>
          <Eyebrow tone="muted">On this page</Eyebrow>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginTop: 14,
              paddingTop: 14,
              borderTop: "1px solid var(--border-hairline)"
            }}
          >
            {headings.map((h) => (
              <span key={h} style={{ font: "var(--type-body-s)", color: "var(--ink-500)" }}>
                {h}
              </span>
            ))}
          </div>

          {related && (
            <div style={{ marginTop: 40, paddingTop: 20, borderTop: "3px solid var(--amber-500)" }}>
              <span
                style={{
                  font: "var(--type-caption)",
                  color: "var(--ink-700)",
                  display: "block",
                  marginBottom: 12
                }}
              >
                {post.paperNote}
              </span>
              <Link href={`/whitepapers/${related.slug}`}>
                <Button variant="secondary" size="sm" icon="download" iconPosition="left">
                  Get the guide
                </Button>
              </Link>
            </div>
          )}
        </aside>
      </div>
    </article>
  );
}
