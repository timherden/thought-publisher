/* The Airtable REST client.

   Whitepaper metadata lives in Airtable; the PDFs stay in S3 and the table holds the
   link. Reads go through Next's fetch cache tagged "papers", so pages are served from
   the CDN like static files and a Studio save calls revalidateTag to publish instantly
   — no rebuild. `revalidate` is a safety net so an edit made directly in Airtable still
   appears within a few minutes. */

const API = "https://api.airtable.com/v0";
const CONTENT_API = "https://content.airtable.com/v0";

export const PAPERS_TAG = "papers";
const TTL = 300;

export const BASE_ID = process.env.AIRTABLE_BASE_ID ?? "appv3HkO1on201a97";
export const TABLE = process.env.AIRTABLE_TABLE ?? "Whitepapers";

export const configured = () => Boolean(process.env.AIRTABLE_TOKEN);

export class AirtableError extends Error {}

export type Attachment = { id: string; url?: string; filename?: string; type?: string };

export type Record = {
  id: string;
  fields: {
    Title?: string;
    Slug?: string;
    "PDF URL"?: string;
    Cover?: Attachment[];
    Pages?: number;
    Summary?: string;
    "Published Date"?: string;
    Status?: "Draft" | "Published";
  };
};

function auth() {
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) throw new AirtableError("AIRTABLE_TOKEN is not set.");
  return { authorization: `Bearer ${token}` };
}

async function fail(res: Response): Promise<never> {
  const body = await res.text();
  if (res.status === 401 || res.status === 403) {
    throw new AirtableError(
      "Airtable rejected the token — check AIRTABLE_TOKEN and that it can read and write this base."
    );
  }
  if (res.status === 404) {
    throw new AirtableError(`Airtable could not find the base or table (${BASE_ID}/${TABLE}).`);
  }
  if (res.status === 422) {
    throw new AirtableError(`Airtable rejected the fields: ${body.slice(0, 200)}`);
  }
  throw new AirtableError(`Airtable API ${res.status}: ${body.slice(0, 200)}`);
}

/* ── Read ────────────────────────────────────────────────── */

/* Cached and tagged. Attachment URLs in the response are short-lived, which is why
   covers are served through app/covers/[file] rather than linked directly.

   Read failures are swallowed on purpose: a bad token or an Airtable outage should cost
   the whitepaper list, not the whole site. Writes still fail loudly — see the routes. */
export async function listRecords(): Promise<Record[]> {
  if (!configured()) return [];

  try {
    const out: Record[] = [];
    let offset: string | undefined;

    do {
      const url = new URL(`${API}/${BASE_ID}/${encodeURIComponent(TABLE)}`);
      url.searchParams.set("pageSize", "100");
      if (offset) url.searchParams.set("offset", offset);

      const res = await fetch(url, {
        headers: auth(),
        next: { tags: [PAPERS_TAG], revalidate: TTL }
      });
      if (!res.ok) await fail(res);

      const json = await res.json();
      out.push(...(json.records ?? []));
      offset = json.offset;
    } while (offset);

    return out;
  } catch (e) {
    console.error("[airtable] could not list whitepapers:", (e as Error).message);
    return [];
  }
}

/* The same read, but throwing — Studio needs to know why the list is empty. */
export async function listRecordsStrict(): Promise<Record[]> {
  const url = new URL(`${API}/${BASE_ID}/${encodeURIComponent(TABLE)}`);
  url.searchParams.set("pageSize", "100");
  const res = await fetch(url, { headers: auth(), cache: "no-store" });
  if (!res.ok) await fail(res);
  return (await res.json()).records ?? [];
}

/* Uncached — used by the routes that write, and by the cover proxy, which needs a
   attachment URL that has not expired. */
export async function findRecord(slug: string): Promise<Record | undefined> {
  if (!configured()) return undefined;

  const url = new URL(`${API}/${BASE_ID}/${encodeURIComponent(TABLE)}`);
  url.searchParams.set("maxRecords", "1");
  url.searchParams.set("filterByFormula", `{Slug} = ${escapeFormula(slug)}`);

  const res = await fetch(url, { headers: auth(), cache: "no-store" });
  if (!res.ok) await fail(res);

  const json = await res.json();
  return json.records?.[0];
}

/* Airtable formulas take single-quoted strings; a quote or backslash in the value
   would otherwise break out of the literal. */
function escapeFormula(value: string) {
  return `'${String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

/* ── Write ───────────────────────────────────────────────── */

export async function createRecord(fields: Record["fields"]): Promise<Record> {
  const res = await fetch(`${API}/${BASE_ID}/${encodeURIComponent(TABLE)}`, {
    method: "POST",
    headers: { ...auth(), "content-type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ fields, typecast: true })
  });
  if (!res.ok) await fail(res);
  return res.json();
}

export async function updateRecord(id: string, fields: Record["fields"]): Promise<Record> {
  const res = await fetch(`${API}/${BASE_ID}/${encodeURIComponent(TABLE)}/${id}`, {
    method: "PATCH",
    headers: { ...auth(), "content-type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ fields, typecast: true })
  });
  if (!res.ok) await fail(res);
  return res.json();
}

export async function deleteRecord(id: string): Promise<void> {
  const res = await fetch(`${API}/${BASE_ID}/${encodeURIComponent(TABLE)}/${id}`, {
    method: "DELETE",
    headers: auth(),
    cache: "no-store"
  });
  if (!res.ok) await fail(res);
}

/* Attachments cannot be set by value through the records API — Airtable either fetches
   a URL you supply, or takes the bytes on this separate content endpoint. The bytes are
   what we have, and they are never public anywhere else, so we upload them. 5 MB cap.

   uploadAttachment APPENDS. Left alone, every re-save would stack another cover on the
   record forever, and readers taking the first attachment would keep showing the oldest
   one after the PDF changed. So we upload, then trim the field to just what we added —
   in that order, so the record is never briefly without a cover. */
export async function setCover(recordId: string, png: Buffer, filename: string) {
  if (png.length > 5 * 1024 * 1024) {
    throw new AirtableError("The rendered cover is larger than Airtable's 5 MB limit.");
  }

  const res = await fetch(
    `${CONTENT_API}/${BASE_ID}/${recordId}/${encodeURIComponent("Cover")}/uploadAttachment`,
    {
      method: "POST",
      headers: { ...auth(), "content-type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        contentType: "image/png",
        filename,
        file: png.toString("base64")
      })
    }
  );
  if (!res.ok) await fail(res);

  /* This endpoint keys `fields` by field ID, not field name, unlike the records API.
     Take the one attachment list it returns rather than guessing which spelling. */
  const returned = (await res.json())?.fields ?? {};
  const attachments: Attachment[] =
    returned.Cover ?? (Object.values(returned).find(Array.isArray) as Attachment[]) ?? [];

  const newest = attachments[attachments.length - 1];
  if (!newest) throw new AirtableError("Airtable accepted the cover but returned no attachment.");

  // Keeping a subset by id is the only way to remove attachments; ids cannot be added.
  if (attachments.length > 1) {
    await updateRecord(recordId, { Cover: [{ id: newest.id }] as Attachment[] });
  }
  return newest;
}
