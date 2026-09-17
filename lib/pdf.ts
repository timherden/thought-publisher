import * as mupdf from "mupdf";

/* Whitepaper PDFs live in a public S3 bucket, not in the repo. Studio takes the URL,
   fetches the file once at save time and renders page 1 to a PNG that is committed
   alongside the markdown. The gallery then loads a plain image: no PDF work in the
   browser, and no dependency on the bucket allowing cross-origin reads. */

export const COVER_WIDTH = 800;

const MAX_BYTES = 40 * 1024 * 1024;

export type PdfMeta = { cover: Buffer; pages: number; bytes: number };

export class PdfError extends Error {}

/* A public bucket link. http is rejected so a cover is never fetched over plaintext. */
export function assertPdfUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(String(raw || "").trim());
  } catch {
    throw new PdfError("That is not a valid URL.");
  }
  if (url.protocol !== "https:") throw new PdfError("The PDF URL must start with https://");
  return url;
}

export async function fetchPdf(raw: string): Promise<Buffer> {
  const url = assertPdfUrl(raw);

  let res: Response;
  try {
    res = await fetch(url, { redirect: "follow", cache: "no-store" });
  } catch {
    throw new PdfError("Could not reach that URL. Check the bucket is public.");
  }

  // A redirect must not be able to walk the https-only rule back to plaintext.
  if (res.url && new URL(res.url).protocol !== "https:") {
    throw new PdfError("That URL redirected to a non-https address.");
  }

  if (res.status === 403) {
    throw new PdfError("The bucket returned 403 — the object is not publicly readable.");
  }
  if (!res.ok) throw new PdfError(`The URL returned ${res.status}.`);

  const type = res.headers.get("content-type") ?? "";
  if (type && !/pdf|octet-stream/i.test(type)) {
    throw new PdfError(`That URL returned ${type}, not a PDF.`);
  }

  // Refuse before buffering: reading the body first is how a huge object OOMs the function.
  const declared = Number(res.headers.get("content-length") ?? 0);
  if (declared > MAX_BYTES) throw new PdfError("That PDF is larger than 40 MB.");

  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > MAX_BYTES) throw new PdfError("That PDF is larger than 40 MB.");
  if (buf.subarray(0, 5).toString("latin1") !== "%PDF-") {
    throw new PdfError("That file is not a PDF.");
  }
  return buf;
}

/* Page 1 at a fixed width, white-backgrounded so pages with no background
   box do not come out transparent in the gallery. */
export function renderCover(pdf: Buffer): PdfMeta {
  let doc: mupdf.Document;
  try {
    doc = mupdf.Document.openDocument(pdf, "application/pdf");
  } catch {
    throw new PdfError("That PDF could not be opened — it may be corrupt or encrypted.");
  }

  const pages = doc.countPages();
  if (!pages) throw new PdfError("That PDF has no pages.");

  const page = doc.loadPage(0);
  const [x0, , x1] = page.getBounds();
  const width = x1 - x0;
  if (!(width > 0)) throw new PdfError("That PDF's first page has no size.");

  const scale = COVER_WIDTH / width;
  const pixmap = page.toPixmap(
    mupdf.Matrix.scale(scale, scale),
    mupdf.ColorSpace.DeviceRGB,
    false,
    true
  );

  return { cover: Buffer.from(pixmap.asPNG()), pages, bytes: pdf.length };
}

export async function coverFromUrl(url: string): Promise<PdfMeta> {
  return renderCover(await fetchPdf(url));
}
