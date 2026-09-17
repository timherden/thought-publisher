"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const AUTHOR = "Tim Herden";

const LINKS = [
  { href: "/writing", label: "Writing" },
  { href: "/whitepapers", label: "Whitepapers" },
  { href: "/about", label: "About" }
];

export function SiteHeader({ showStudio = true }: { showStudio?: boolean }) {
  const path = usePathname() || "/";

  const item = (href: string, label: string, accent: string) => {
    const active = path === href || path.startsWith(href + "/");
    return (
      <Link
        key={href}
        href={href}
        style={{
          font: "var(--type-ui)",
          letterSpacing: "0.04em",
          color: "var(--ink-900)"
        }}
      >
        {label}
        <div
          style={{
            height: 2,
            marginTop: 6,
            background: active ? accent : "transparent"
          }}
        />
      </Link>
    );
  };

  return (
    <header style={{ borderBottom: "1px solid var(--border-hairline)", background: "var(--paper)" }}>
      <div
        style={{
          maxWidth: 1160,
          margin: "0 auto",
          padding: "20px 32px",
          display: "flex",
          alignItems: "center",
          gap: 32,
          flexWrap: "wrap"
        }}
      >
        <Link
          href="/"
          style={{
            font: "var(--weight-medium) 21px/1 var(--font-display)",
            letterSpacing: "-0.01em",
            color: "var(--ink-900)",
            marginRight: "auto"
          }}
        >
          {AUTHOR}
        </Link>
        <nav style={{ display: "flex", alignItems: "flex-start", gap: 28 }}>
          {LINKS.map((l) => item(l.href, l.label, "var(--teal-500)"))}
          {showStudio && (
            <div style={{ paddingLeft: 28, borderLeft: "1px solid var(--border-hairline)" }}>
              {item("/studio", "Studio", "var(--amber-500)")}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
