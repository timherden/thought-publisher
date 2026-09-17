import matter from "gray-matter";
import { NextResponse } from "next/server";
import { postBySlug } from "@/lib/content";
import { canWrite, commit, StoreError } from "@/lib/store";

/* Writes a post back to content/posts as markdown with frontmatter — committed to the
   repo in production, written to the working tree in development. See lib/store.ts. */

export const runtime = "nodejs";

const POSTS_DIR = "content/posts";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);

export async function POST(req: Request) {
  if (!canWrite()) {
    return NextResponse.json(
      { error: "Saving is not configured. Set GITHUB_TOKEN so Studio can commit." },
      { status: 403 }
    );
  }

  const b = await req.json();
  const slug = slugify(b.slug || b.title || "");
  if (!slug) return NextResponse.json({ error: "A title or slug is required." }, { status: 400 });

  // Slugified: it lands in a delete path, and "../…" must not escape content/posts.
  const originalSlug = b.originalSlug ? slugify(String(b.originalSlug)) : "";

  // Renaming onto an existing essay, or creating one whose title collides, would
  // overwrite it — and inherit its date and pinned flag, hiding the loss.
  if (slug !== originalSlug && postBySlug(slug)) {
    return NextResponse.json(
      { error: `An essay with the slug "${slug}" already exists.` },
      { status: 409 }
    );
  }

  // Preserve fields the editor does not expose. Parsed posts normalise absent
  // frontmatter to "", so fall back on empty, not just on undefined.
  const existing = originalSlug ? postBySlug(originalSlug) : undefined;

  const data = {
    title: b.title || "Untitled",
    tag: b.tag || "Field notes",
    series: b.series,
    date: existing?.date || new Date().toISOString().slice(0, 10),
    status: b.status === "published" ? "published" : "draft",
    pinned: existing?.pinned ?? false,
    standfirst: b.standfirst ?? "",
    sourceLine: existing?.sourceLine || "Author's own, 2026.",
    paperSlug: existing?.paperSlug ?? "",
    paperNote: existing?.paperNote ?? ""
  };

  const deletes =
    originalSlug && originalSlug !== slug ? [`${POSTS_DIR}/${originalSlug}.md`] : [];

  try {
    const result = await commit(
      [
        {
          path: `${POSTS_DIR}/${slug}.md`,
          data: matter.stringify(`\n${(b.body ?? "").trim()}\n`, data)
        }
      ],
      deletes,
      `Studio: ${originalSlug ? "update" : "add"} essay "${data.title}"`
    );
    return NextResponse.json({ slug, ...result });
  } catch (e) {
    if (e instanceof StoreError) {
      return NextResponse.json({ error: e.message }, { status: 502 });
    }
    throw e;
  }
}
