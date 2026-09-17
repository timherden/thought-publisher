"use client";

import { useMemo, useState } from "react";
import { Button, Input, Tag } from "@/lib/ds";
import { PostRow } from "@/components/PostRow";
import { readingTime, type Post } from "@/lib/content";

const LABEL: React.CSSProperties = {
  font: "var(--type-eyebrow)",
  letterSpacing: "var(--tracking-eyebrow)",
  textTransform: "uppercase",
  color: "var(--ink-300)",
  width: 56
};

export function WritingIndex({
  posts,
  tags,
  series,
  initialTag,
  initialSeries
}: {
  posts: Post[];
  tags: string[];
  series: string[];
  initialTag: string;
  initialSeries: string;
}) {
  const [tag, setTag] = useState(initialTag);
  const [ser, setSer] = useState(initialSeries);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      const tagOk = tag === "All" || p.tag === tag;
      const serOk = ser === "All" || p.series === ser;
      const qOk =
        !q || p.title.toLowerCase().includes(q) || p.standfirst.toLowerCase().includes(q);
      return tagOk && serOk && qOk;
    });
  }, [posts, tag, ser, query]);

  const row = (
    label: string,
    values: string[],
    current: string,
    set: (v: string) => void,
    uppercase: boolean
  ) => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      <span style={LABEL}>{label}</span>
      {["All", ...values].map((v) => (
        <button
          key={v}
          onClick={() => set(v)}
          style={{ all: "unset", cursor: "pointer" }}
          aria-pressed={v === current}
        >
          <Tag tone={v === current ? "ink" : "outline"} uppercase={uppercase}>
            {v}
          </Tag>
        </button>
      ))}
    </div>
  );

  return (
    <>
      <div
        style={{
          display: "flex",
          gap: 24,
          flexWrap: "wrap",
          alignItems: "flex-end",
          margin: "40px 0 0",
          paddingBottom: 20,
          borderBottom: "1px solid var(--border-hairline)"
        }}
      >
        <div style={{ flex: "1 1 420px", display: "flex", flexDirection: "column", gap: 14 }}>
          {row("Topic", tags, tag, setTag, true)}
          {row("Series", series, ser, setSer, false)}
        </div>
        <div style={{ flex: "0 1 260px" }}>
          <Input
            size="sm"
            placeholder="Search titles and summaries"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {filtered.map((p) => (
          <PostRow key={p.slug} post={p} meta={`${p.series} · ${readingTime(p.body)}`} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: "48px 0" }}>
          <p style={{ font: "var(--type-body)", color: "var(--ink-500)", margin: "0 0 20px" }}>
            Nothing matches that.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setTag("All");
              setSer("All");
              setQuery("");
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
    </>
  );
}
