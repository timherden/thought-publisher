import Link from "next/link";
import { Card, Icon } from "@/lib/ds";
import type { Paper } from "@/lib/content";
import { fmtDate } from "@/lib/formatting";

/* The cover is page 1 of the PDF, rendered at save time. It is shown top-aligned rather
   than centred: the title block of a paper is at the top of the page, and that is the part
   worth seeing in a grid. */

export function PaperCover({ paper, radius = 0 }: { paper: Paper; radius?: number }) {
  return (
    <div
      style={{
        position: "relative",
        aspectRatio: "1 / 1.294",
        background: "var(--paper-cool)",
        borderBottom: radius ? "none" : "1px solid var(--border-hairline)",
        borderRadius: radius || undefined,
        overflow: "hidden"
      }}
    >
      {paper.cover ? (
        <img
          src={paper.cover}
          alt={`First page of ${paper.title}`}
          loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Icon name="file-text" size={28} color="var(--ink-300)" />
        </div>
      )}
    </div>
  );
}

export function PaperCard({ paper }: { paper: Paper }) {
  return (
    <Link href={`/whitepapers/${paper.slug}`}>
      <Card variant="hairline" padding="none" interactive style={{ height: "100%", overflow: "hidden" }}>
        <PaperCover paper={paper} />
        <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ font: "var(--font-mono)", fontSize: 12, color: "var(--ink-500)" }}>
              {paper.pages} {paper.pages === 1 ? "page" : "pages"}
            </span>
            <span style={{ font: "var(--font-mono)", fontSize: 12, color: "var(--ink-300)" }}>·</span>
            <span style={{ font: "var(--font-mono)", fontSize: 12, color: "var(--ink-500)" }}>
              {fmtDate(paper.date)}
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

          {paper.summary && (
            <p style={{ font: "var(--type-body-s)", color: "var(--ink-700)", margin: 0 }}>
              {paper.summary}
            </p>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 2 }}>
            <Icon name="download" size={16} color="var(--teal-700)" />
            <span style={{ font: "var(--type-ui)", letterSpacing: "0.04em", color: "var(--teal-700)" }}>
              Download PDF
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
