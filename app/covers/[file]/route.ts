import { findRecord } from "@/lib/airtable";
import { slugify } from "@/lib/papers";

/* Serves a whitepaper cover from the Airtable attachment.

   Airtable's attachment URLs expire after a couple of hours, so the site cannot link to
   them: images would work in Studio and then quietly break for visitors. This route
   resolves a fresh URL per request, streams the bytes from our own origin, and lets the
   CDN hold the result — so Airtable is hit once per edge region, not once per visitor.

   Cache is keyed on the attachment id, so re-rendering a cover produces a new URL. */

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const slug = slugify(file.replace(/\.png$/i, ""));
  if (!slug) return new Response("Not found", { status: 404 });

  const record = await findRecord(slug).catch(() => undefined);
  // Newest, not first: a re-saved record can briefly hold more than one.
  const all = record?.fields.Cover ?? [];
  const cover = all[all.length - 1];
  if (!cover?.url) return new Response("Not found", { status: 404 });

  const upstream = await fetch(cover.url, { cache: "no-store" });
  if (!upstream.ok) return new Response("Cover unavailable", { status: 502 });

  return new Response(await upstream.arrayBuffer(), {
    headers: {
      "content-type": cover.type || "image/png",
      /* Long-lived at the CDN, revalidated in the background. A replaced cover changes
         the attachment id, and Studio revalidates the pages that reference it. */
      "cache-control": "public, max-age=0, s-maxage=31536000, stale-while-revalidate=86400",
      etag: `"${cover.id}"`
    }
  });
}
