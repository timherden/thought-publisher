"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Callout, Card, Eyebrow, Input, Tag } from "@/lib/ds";
import { readingTime } from "@/lib/formatting";
import type { Paper, Post } from "@/lib/content";

type Draft = {
  slug: string;
  title: string;
  tag: string;
  series: string;
  standfirst: string;
  body: string;
  status: "published" | "draft";
  isNew: boolean;
};

const LABEL: React.CSSProperties = {
  font: "var(--type-eyebrow)",
  letterSpacing: "var(--tracking-eyebrow)",
  textTransform: "uppercase",
  color: "var(--ink-500)",
  display: "block",
  marginBottom: 8,
};

const AREA: React.CSSProperties = {
  width: "100%",
  color: "var(--ink-900)",
  background: "var(--paper)",
  border: "1px solid var(--border-hairline)",
  borderRadius: 3,
  padding: "10px 12px",
  resize: "vertical",
  outlineOffset: 2,
};

function toDraft(p: Post): Draft {
  return {
    slug: p.slug,
    title: p.title,
    tag: p.tag,
    series: p.series,
    standfirst: p.standfirst,
    body: p.body,
    status: p.status,
    isNew: false,
  };
}

export function StudioClient({
  posts,
  papers,
  series,
  pdfBase,
  canWrite,
}: {
  posts: Post[];
  papers: Paper[];
  series: string[];
  pdfBase: string;
  canWrite: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"posts" | "papers">("posts");
  const [selected, setSelected] = useState(posts[0]?.slug ?? "");
  const [form, setForm] = useState<Draft>(
    posts[0] ? toDraft(posts[0]) : blank(series[0]),
  );
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function blank(s: string): Draft {
    return {
      slug: "",
      title: "",
      tag: "",
      series: s,
      standfirst: "",
      body: "",
      status: "draft",
      isNew: true,
    };
  }

  const patch = (p: Partial<Draft>) => {
    setForm((f) => ({ ...f, ...p }));
    setDirty(true);
    setMessage("");
  };

  const edit = (post: Post) => {
    setSelected(post.slug);
    setForm(toDraft(post));
    setDirty(false);
    setMessage("");
  };

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/studio/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          originalSlug: form.isNew ? null : selected,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      setDirty(false);
      setSelected(json.slug);
      setForm((f) => ({ ...f, slug: json.slug, isNew: false }));
      setMessage(`Saved content/posts/${json.slug}.md`);
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const drafts = posts.filter((p) => p.status === "draft").length;

  return (
    <section
      style={{ maxWidth: 1160, margin: "0 auto", padding: "48px 32px 0" }}
    >
      <div
        style={{
          display: "flex",
          gap: 24,
          flexWrap: "wrap",
          alignItems: "flex-end",
          paddingBottom: 24,
          borderBottom: "1px solid var(--border-hairline)",
        }}
      >
        <div style={{ flex: "1 1 auto" }}>
          <Eyebrow tone="amber">Private · not published</Eyebrow>
          <h1
            style={{
              font: "var(--type-h2)",
              letterSpacing: "var(--tracking-heading)",
              margin: "14px 0 0",
            }}
          >
            Studio
          </h1>
          <p
            style={{
              font: "var(--type-body-s)",
              color: "var(--ink-500)",
              margin: "8px 0 0",
            }}
          >
            {posts.length} essays · {drafts} in draft · {papers.length}{" "}
            whitepapers
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={() => setTab("posts")}
            style={{ all: "unset", cursor: "pointer" }}
          >
            <Tag tone={tab === "posts" ? "ink" : "outline"}>Essays</Tag>
          </button>
          <button
            onClick={() => setTab("papers")}
            style={{ all: "unset", cursor: "pointer" }}
          >
            <Tag tone={tab === "papers" ? "ink" : "outline"}>Whitepapers</Tag>
          </button>
        </div>
      </div>

      {tab === "posts" && (
        <div
          style={{ display: "flex", gap: 40, flexWrap: "wrap", marginTop: 32 }}
        >
          <div style={{ flex: "1 1 420px", minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 8,
              }}
            >
              <Eyebrow tone="muted">All essays</Eyebrow>
              <div style={{ marginLeft: "auto" }}>
                <Button
                  variant="secondary"
                  size="sm"
                  icon="plus"
                  iconPosition="left"
                  onClick={() => {
                    setForm(blank(series[0]));
                    setSelected("");
                    setDirty(true);
                  }}
                >
                  New essay
                </Button>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {posts.map((p) => (
                <button
                  key={p.slug}
                  onClick={() => edit(p)}
                  style={{
                    all: "unset",
                    display: "flex",
                    gap: 16,
                    alignItems: "center",
                    flexWrap: "wrap",
                    padding: "14px 12px",
                    margin: "0 -12px",
                    borderBottom: "1px solid var(--border-hairline)",
                    cursor: "pointer",
                    background:
                      p.slug === selected ? "var(--paper-cool)" : "transparent",
                  }}
                >
                  <span
                    style={{
                      flex: "0 0 8px",
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background:
                        p.status === "published"
                          ? "var(--teal-500)"
                          : "var(--amber-500)",
                    }}
                  />
                  <span style={{ flex: "1 1 240px", minWidth: 0 }}>
                    <span
                      style={{
                        font: "var(--type-body-s)",
                        color: "var(--ink-900)",
                        display: "block",
                      }}
                    >
                      {p.title}
                    </span>
                    <span
                      style={{
                        font: "var(--font-mono)",
                        fontSize: 12,
                        color: "var(--ink-300)",
                      }}
                    >
                      /writing/{p.slug}
                    </span>
                  </span>
                  <span
                    style={{
                      flex: "0 0 auto",
                      font: "var(--type-caption)",
                      color: "var(--ink-500)",
                    }}
                  >
                    {p.series}
                  </span>
                  <span
                    style={{
                      flex: "0 0 72px",
                      font: "var(--font-mono)",
                      fontSize: 12,
                      color: "var(--ink-500)",
                      textAlign: "right",
                    }}
                  >
                    {p.status === "published" ? "Live" : "Draft"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: "1 1 400px", minWidth: 0 }}>
            <Card variant="hairline" padding="lg" accent="ink">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 24,
                }}
              >
                <Eyebrow tone="ink">
                  {form.isNew ? "New essay" : "Editing"}
                </Eyebrow>
                {dirty && (
                  <span
                    style={{
                      font: "var(--font-mono)",
                      fontSize: 12,
                      color: "var(--amber-600)",
                    }}
                  >
                    unsaved
                  </span>
                )}
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 20 }}
              >
                <Input
                  label="Title"
                  value={form.title}
                  onChange={(e) => patch({ title: e.target.value })}
                />

                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ flex: "1 1 160px" }}>
                    <Input
                      label="Slug"
                      value={form.slug}
                      hint={`/writing/${form.slug || "…"}`}
                      onChange={(e) => patch({ slug: e.target.value })}
                    />
                  </div>
                  <div style={{ flex: "1 1 160px" }}>
                    <Input
                      label="Topic tag"
                      value={form.tag}
                      onChange={(e) => patch({ tag: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label style={LABEL}>Series</label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {series.map((s) => (
                      <button
                        key={s}
                        onClick={() => patch({ series: s })}
                        style={{ all: "unset", cursor: "pointer" }}
                      >
                        <Tag
                          tone={s === form.series ? "ink" : "outline"}
                          uppercase={false}
                        >
                          {s}
                        </Tag>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={LABEL}>Standfirst</label>
                  <textarea
                    rows={3}
                    value={form.standfirst}
                    onChange={(e) => patch({ standfirst: e.target.value })}
                    style={{ ...AREA, font: "var(--type-body-s)" }}
                  />
                </div>

                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 12,
                      marginBottom: 8,
                    }}
                  >
                    <label style={{ ...LABEL, marginBottom: 0 }}>Body</label>
                    <span
                      style={{
                        font: "var(--font-mono)",
                        fontSize: 12,
                        color: "var(--ink-300)",
                        marginLeft: "auto",
                      }}
                    >
                      {readingTime(form.body)} read
                    </span>
                  </div>
                  <textarea
                    rows={16}
                    value={form.body}
                    onChange={(e) => patch({ body: e.target.value })}
                    style={{
                      ...AREA,
                      background: "var(--paper-cool)",
                      font: "400 14px/1.7 var(--font-mono)",
                      padding: 14,
                    }}
                  />
                  <p
                    style={{
                      font: "var(--type-caption)",
                      color: "var(--ink-500)",
                      margin: "8px 0 0",
                    }}
                  >
                    Markdown subset: <code>## heading</code>,{" "}
                    <code>&gt; quote</code>, <code>- list item</code>,{" "}
                    <code>!! Title :: takeaway</code>. Headings become the table
                    of contents.
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    flexWrap: "wrap",
                    alignItems: "center",
                    paddingTop: 8,
                    borderTop: "1px solid var(--border-hairline)",
                  }}
                >
                  <Button
                    variant="primary"
                    icon="check"
                    iconPosition="left"
                    disabled={!canWrite || saving || !form.title}
                    onClick={save}
                  >
                    {saving ? "Saving" : "Save"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      patch({
                        status:
                          form.status === "published" ? "draft" : "published",
                      })
                    }
                  >
                    {form.status === "published" ? "Unpublish" : "Publish"}
                  </Button>
                  <span
                    style={{
                      marginLeft: "auto",
                      font: "var(--font-mono)",
                      fontSize: 12,
                      color: "var(--ink-500)",
                    }}
                  >
                    {message}
                  </span>
                </div>

                {!canWrite && (
                  <Callout
                    tone="caution"
                    title="Saving is off in this environment"
                  >
                    Studio writes to content/posts on disk, which only works
                    when the app runs with a writable filesystem. Set
                    STUDIO_WRITES=on locally, or switch the save route to commit
                    through the GitHub API.
                  </Callout>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === "papers" && (
        <div style={{ marginTop: 32 }}>
          <Eyebrow tone="muted">All whitepapers</Eyebrow>
          <div
            style={{ display: "flex", flexDirection: "column", marginTop: 8 }}
          >
            {papers.map((p) => (
              <div
                key={p.slug}
                style={{
                  display: "flex",
                  gap: 20,
                  alignItems: "center",
                  flexWrap: "wrap",
                  padding: "18px 0",
                  borderBottom: "1px solid var(--border-hairline)",
                }}
              >
                <span
                  style={{
                    flex: "0 0 8px",
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background:
                      p.status === "published"
                        ? "var(--teal-500)"
                        : "var(--amber-500)",
                  }}
                />
                <div style={{ flex: "1 1 260px", minWidth: 0 }}>
                  <span
                    style={{
                      font: "var(--type-body-s)",
                      color: "var(--ink-900)",
                      display: "block",
                    }}
                  >
                    {p.title}
                  </span>
                  <span
                    style={{
                      font: "var(--font-mono)",
                      fontSize: 12,
                      color: "var(--ink-300)",
                    }}
                  >
                    {pdfBase}/{p.slug}.pdf
                  </span>
                </div>
                <span
                  style={{
                    flex: "0 0 auto",
                    font: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--ink-500)",
                  }}
                >
                  {p.pages} pages
                </span>
                <span
                  style={{
                    flex: "0 0 80px",
                    font: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--ink-500)",
                    textAlign: "right",
                  }}
                >
                  {p.status === "published" ? "Live" : "Draft"}
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 40, maxWidth: 620 }}>
            <Callout tone="note" title="Where the PDF files live">
              Each whitepaper serves the file at {pdfBase}/&lt;slug&gt;.pdf.
              Commit the PDF to public/pdfs — Studio records the path, it does
              not store the binary. Whitepaper frontmatter is edited directly in
              content/papers.
            </Callout>
          </div>
        </div>
      )}
    </section>
  );
}
