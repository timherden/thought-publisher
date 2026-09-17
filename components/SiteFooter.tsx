const AUTHOR = "Tim Herden";

export function SiteFooter() {
  return (
    <footer
      style={{
        marginTop: 96,
        borderTop: "1px solid var(--border-hairline)",
        background: "var(--paper)"
      }}
    >
      <div
        style={{
          maxWidth: 1160,
          margin: "0 auto",
          padding: 32,
          display: "flex",
          gap: 24,
          flexWrap: "wrap",
          alignItems: "baseline"
        }}
      >
        <span
          style={{
            font: "var(--weight-medium) 15px/1 var(--font-display)",
            letterSpacing: "-0.01em",
            marginRight: "auto"
          }}
        >
          {AUTHOR}
        </span>
        <span style={{ font: "var(--type-caption)", color: "var(--ink-500)" }}>
          Written independently. Not endorsed by, or affiliated with, any employer.
        </span>
        <span style={{ font: "var(--font-mono)", fontSize: 12, color: "var(--ink-300)" }}>© 2026</span>
      </div>
    </footer>
  );
}
