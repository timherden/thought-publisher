import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import seriesData from "@/content/series.json";

export type Series = { name: string; note: string };
export const SERIES: Series[] = seriesData as Series[];

export type Post = {
  slug: string;
  title: string;
  tag: string;
  series: string;
  date: string;
  status: "published" | "draft";
  pinned: boolean;
  standfirst: string;
  sourceLine: string;
  paperSlug: string;
  paperNote: string;
  body: string;
};

export type PaperEntry = { num: string; label: string; page: string };

export type Paper = {
  slug: string;
  title: string;
  pages: number;
  date: string;
  status: "published" | "draft";
  summary: string;
  sourceLine: string;
  relatedSlug: string;
  relatedTitle: string;
  contents: PaperEntry[];
};

export type Block =
  | { type: "para"; text: string }
  | { type: "h2"; text: string }
  | { type: "quote"; text: string }
  | { type: "callout"; title: string; text: string }
  | { type: "list"; items: { text: string }[] };

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const PAPERS_DIR = path.join(process.cwd(), "content", "papers");

export const PDF_BASE = "/pdfs";

function readDir(dir: string) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
}

/* ── Content ─────────────────────────────────────────────── */

export function allPosts(): Post[] {
  return readDir(POSTS_DIR)
    .map((file) => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
      const { data, content } = matter(raw);
      return {
        slug: file.replace(/\.md$/, ""),
        title: String(data.title ?? "Untitled"),
        tag: String(data.tag ?? "Field notes"),
        series: String(data.series ?? SERIES[0].name),
        date: String(data.date ?? "").slice(0, 10),
        status: data.status === "draft" ? "draft" : "published",
        pinned: data.pinned === true,
        standfirst: String(data.standfirst ?? ""),
        sourceLine: String(data.sourceLine ?? ""),
        paperSlug: String(data.paperSlug ?? ""),
        paperNote: String(data.paperNote ?? ""),
        body: content.trim()
      } as Post;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function publishedPosts(): Post[] {
  return allPosts().filter((p) => p.status === "published");
}

export function postBySlug(slug: string): Post | undefined {
  return allPosts().find((p) => p.slug === slug);
}

export function pinnedPost(): Post {
  const live = publishedPosts();
  return live.find((p) => p.pinned) ?? live[0];
}

export function allPapers(): Paper[] {
  return readDir(PAPERS_DIR)
    .map((file) => {
      const { data } = matter(fs.readFileSync(path.join(PAPERS_DIR, file), "utf8"));
      return {
        slug: file.replace(/\.md$/, ""),
        title: String(data.title ?? "Untitled"),
        pages: Number(data.pages ?? 0),
        date: String(data.date ?? ""),
        status: data.status === "draft" ? "draft" : "published",
        summary: String(data.summary ?? ""),
        sourceLine: String(data.sourceLine ?? ""),
        relatedSlug: String(data.relatedSlug ?? ""),
        relatedTitle: String(data.relatedTitle ?? ""),
        contents: (data.contents ?? []) as PaperEntry[]
      } as Paper;
    })
    .sort((a, b) => (a.title < b.title ? -1 : 1));
}

export function publishedPapers(): Paper[] {
  return allPapers().filter((p) => p.status === "published");
}

export function paperBySlug(slug: string): Paper | undefined {
  return allPapers().find((p) => p.slug === slug);
}

export function seriesWithCounts() {
  const live = publishedPosts();
  return SERIES.map((s) => ({
    ...s,
    count: live.filter((p) => p.series === s.name).length
  }));
}

export function siblings(post: Post, limit = 3): Post[] {
  return publishedPosts()
    .filter((p) => p.series === post.series && p.slug !== post.slug)
    .slice(0, limit);
}

/* ── Derived ─────────────────────────────────────────────── */

/* The markdown subset. Five block types, one per design-system treatment.
   Blocks are separated by a blank line. */
export function mdToBlocks(md: string): Block[] {
  return String(md || "")
    .split(/\n\s*\n/)
    .map((chunk): Block | null => {
      const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
      if (!lines.length) return null;
      if (lines[0].startsWith("## ")) return { type: "h2", text: lines[0].slice(3) };
      if (lines[0].startsWith("> ")) {
        return { type: "quote", text: lines.map((l) => l.replace(/^>\s*/, "")).join(" ") };
      }
      if (lines[0].startsWith("!! ")) {
        const rest = lines.join(" ").slice(3);
        const i = rest.indexOf(" :: ");
        return i > -1
          ? { type: "callout", title: rest.slice(0, i), text: rest.slice(i + 4) }
          : { type: "callout", title: "Note", text: rest };
      }
      if (lines.every((l) => l.startsWith("- "))) {
        return { type: "list", items: lines.map((l) => ({ text: l.slice(2) })) };
      }
      return { type: "para", text: lines.join(" ") };
    })
    .filter((b): b is Block => b !== null);
}

export function toc(md: string): string[] {
  return mdToBlocks(md)
    .filter((b) => b.type === "h2")
    .map((b) => (b as { text: string }).text);
}
