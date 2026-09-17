import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { NextResponse } from "next/server";

/* Writes a post back to content/posts as markdown with frontmatter.
   Off unless the filesystem is writable — see STUDIO_WRITES in the README. */

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

const writable = () => process.env.STUDIO_WRITES === "on" || process.env.NODE_ENV === "development";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);

export async function POST(req: Request) {
  if (!writable()) {
    return NextResponse.json({ error: "Saving is disabled in this environment." }, { status: 403 });
  }

  const b = await req.json();
  const slug = slugify(b.slug || b.title || "");
  if (!slug) return NextResponse.json({ error: "A title or slug is required." }, { status: 400 });

  const target = path.join(POSTS_DIR, `${slug}.md`);
  const original = b.originalSlug ? path.join(POSTS_DIR, `${b.originalSlug}.md`) : null;

  // Preserve fields the editor does not expose.
  let keep: Record<string, unknown> = {};
  if (original && fs.existsSync(original)) {
    keep = matter(fs.readFileSync(original, "utf8")).data;
  }

  const data = {
    title: b.title || "Untitled",
    tag: b.tag || "Field notes",
    series: b.series,
    date: keep.date ?? new Date().toISOString().slice(0, 10),
    status: b.status === "published" ? "published" : "draft",
    pinned: keep.pinned ?? false,
    standfirst: b.standfirst ?? "",
    sourceLine: keep.sourceLine ?? "Author's own, 2026.",
    paperSlug: keep.paperSlug ?? "",
    paperNote: keep.paperNote ?? ""
  };

  fs.mkdirSync(POSTS_DIR, { recursive: true });
  fs.writeFileSync(target, matter.stringify(`\n${(b.body ?? "").trim()}\n`, data), "utf8");

  if (original && original !== target && fs.existsSync(original)) fs.unlinkSync(original);

  return NextResponse.json({ slug });
}
