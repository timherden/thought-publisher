import { configured, listRecords, listRecordsStrict, type Record } from "@/lib/airtable";

/* Whitepapers, read from Airtable.

   These are async where the markdown-backed essays in lib/content.ts are sync — the
   data is over the network now. Every caller is a server component, so awaiting is free. */

export type Paper = {
  id: string;
  slug: string;
  title: string;
  pdfUrl: string;
  /* Our own cached route, not the Airtable attachment URL — those expire. Empty when
     the record has no cover yet, so cards render their placeholder. */
  cover: string;
  pages: number;
  date: string;
  status: "published" | "draft";
  summary: string;
};

export const slugify = (s: string) =>
  String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);

export function toPaper(r: Record): Paper {
  const f = r.fields;
  const slug = f.Slug?.trim() || slugify(f.Title ?? "");
  return {
    id: r.id,
    slug,
    title: f.Title?.trim() || "Untitled",
    pdfUrl: f["PDF URL"]?.trim() ?? "",
    cover: f.Cover?.length ? `/covers/${slug}.png` : "",
    pages: Number(f.Pages ?? 0),
    date: String(f["Published Date"] ?? "").slice(0, 10),
    status: f.Status === "Published" ? "published" : "draft",
    summary: f.Summary?.trim() ?? ""
  };
}

export async function allPapers(): Promise<Paper[]> {
  const records = await listRecords();
  return records
    .map(toPaper)
    .filter((p) => p.slug)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function publishedPapers(): Promise<Paper[]> {
  return (await allPapers()).filter((p) => p.status === "published");
}

export async function paperBySlug(slug: string): Promise<Paper | undefined> {
  return (await allPapers()).find((p) => p.slug === slug);
}

/* Studio's read: reports why the list is empty instead of showing nothing. */
export async function papersForStudio(): Promise<{ papers: Paper[]; error: string }> {
  if (!configured()) {
    return { papers: [], error: "AIRTABLE_TOKEN is not set, so Studio cannot read the base." };
  }
  try {
    const papers = (await listRecordsStrict())
      .map(toPaper)
      .filter((p) => p.slug)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
    return { papers, error: "" };
  } catch (e) {
    return { papers: [], error: (e as Error).message };
  }
}
