import Link from "next/link";
import { fmtDate, readingTime } from "@/lib/formatting";
import type { Post } from "@/lib/content";

/* One row in an index list: date, title, standfirst, and a right-hand meta note. */
export function PostRow({ post, meta }: { post: Post; meta?: string }) {
  return (
    <Link
      href={`/writing/${post.slug}`}
      style={{
        display: "flex",
        gap: 28,
        alignItems: "baseline",
        flexWrap: "wrap",
        padding: "24px 0",
        borderBottom: "1px solid var(--border-hairline)",
        color: "var(--ink-900)"
      }}
    >
      <span
        style={{
          flex: "0 0 96px",
          font: "var(--font-mono)",
          fontSize: 13,
          color: "var(--ink-500)"
        }}
      >
        {fmtDate(post.date)}
      </span>
      <div style={{ flex: "1 1 340px", minWidth: 0 }}>
        <h3 style={{ font: "var(--type-h3)", letterSpacing: "var(--tracking-heading)", margin: 0 }}>
          {post.title}
        </h3>
        <p
          style={{
            font: "var(--type-body-s)",
            color: "var(--ink-500)",
            margin: "8px 0 0",
            maxWidth: "62ch"
          }}
        >
          {post.standfirst}
        </p>
      </div>
      <span style={{ flex: "0 0 auto", font: "var(--type-caption)", color: "var(--ink-300)" }}>
        {meta ?? readingTime(post.body)}
      </span>
    </Link>
  );
}
