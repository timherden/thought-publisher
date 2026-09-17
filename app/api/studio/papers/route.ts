import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  AirtableError,
  configured,
  createRecord,
  deleteRecord,
  findRecord,
  PAPERS_TAG,
  setCover,
  updateRecord
} from "@/lib/airtable";
import { coverFromUrl, PdfError } from "@/lib/pdf";
import { slugify } from "@/lib/papers";

/* Create, update and delete whitepapers.

   A save writes the record to Airtable, renders page 1 of the PDF and uploads it as the
   Cover attachment, then revalidates the pages that read it — so publishing is immediate
   and does not rebuild the site. mupdf is wasm, so this route is nodejs, not edge. */

export const runtime = "nodejs";
export const maxDuration = 60;

function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function publish(slug: string) {
  revalidateTag(PAPERS_TAG);
  revalidatePath("/whitepapers");
  revalidatePath(`/whitepapers/${slug}`);
  revalidatePath("/");
}

export async function POST(req: Request) {
  if (!configured()) return fail("Set AIRTABLE_TOKEN so Studio can save.", 403);

  const body = await req.json().catch(() => null);
  if (!body) return fail("Malformed request.");

  const title = String(body.title ?? "").trim();
  if (!title) return fail("A title is required.");

  const slug = slugify(body.slug || title);
  if (!slug) return fail("That title does not produce a usable slug — add some letters.");

  const originalSlug = body.originalSlug ? slugify(body.originalSlug) : "";

  try {
    // Renaming onto an existing paper, or creating one whose title collides, would
    // leave two records claiming the same public URL.
    if (slug !== originalSlug && (await findRecord(slug))) {
      return fail(`A whitepaper with the slug "${slug}" already exists.`, 409);
    }

    const existing = originalSlug ? await findRecord(originalSlug) : undefined;
    if (originalSlug && !existing) return fail("That whitepaper no longer exists.", 404);

    // Render before writing: a bad URL should not leave a half-made record behind.
    let rendered;
    try {
      rendered = await coverFromUrl(String(body.pdfUrl ?? ""));
    } catch (e) {
      if (e instanceof PdfError) return fail(e.message, 422);
      throw e;
    }

    const fields = {
      Title: title,
      Slug: slug,
      "PDF URL": String(body.pdfUrl).trim(),
      Pages: rendered.pages,
      Summary: String(body.summary ?? "").trim(),
      "Published Date":
        String(body.date || "").slice(0, 10) || new Date().toISOString().slice(0, 10),
      Status: body.status === "published" ? ("Published" as const) : ("Draft" as const)
    };

    const record = existing
      ? await updateRecord(existing.id, fields)
      : await createRecord(fields);

    // Attachments need the record to exist first, so this is a second call.
    await setCover(record.id, rendered.cover, `${slug}.png`);

    publish(slug);
    if (originalSlug && originalSlug !== slug) revalidatePath(`/whitepapers/${originalSlug}`);

    return NextResponse.json({ slug, pages: rendered.pages, id: record.id });
  } catch (e) {
    if (e instanceof AirtableError) return fail(e.message, 502);
    throw e;
  }
}

export async function DELETE(req: Request) {
  if (!configured()) return fail("Set AIRTABLE_TOKEN so Studio can save.", 403);

  const body = await req.json().catch(() => null);
  const slug = slugify(body?.slug ?? "");
  if (!slug) return fail("A slug is required.");

  try {
    const record = await findRecord(slug);
    if (!record) return fail("No such whitepaper.", 404);

    await deleteRecord(record.id);
    publish(slug);
    return NextResponse.json({ slug });
  } catch (e) {
    if (e instanceof AirtableError) return fail(e.message, 502);
    throw e;
  }
}

/* Renders page 1 so Studio can show the cover before anything is written. */
export async function PUT(req: Request) {
  if (!configured()) return fail("Studio is not configured.", 403);

  const body = await req.json().catch(() => null);
  try {
    const { cover, pages } = await coverFromUrl(String(body?.pdfUrl ?? ""));
    return NextResponse.json({
      pages,
      preview: `data:image/png;base64,${cover.toString("base64")}`
    });
  } catch (e) {
    if (e instanceof PdfError) return fail(e.message, 422);
    throw e;
  }
}
