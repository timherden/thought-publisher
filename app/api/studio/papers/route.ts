import matter from "gray-matter";
import { NextResponse } from "next/server";
import { COVER_BASE, paperBySlug } from "@/lib/content";
import { coverFromUrl, PdfError } from "@/lib/pdf";
import { canWrite, commit, StoreError, usingGit } from "@/lib/store";

/* Create, update and delete whitepapers.

   A save is: fetch the PDF from its public URL, render page 1, then commit the markdown
   and the cover together. mupdf is a wasm module, so this route is nodejs, not edge. */

export const runtime = "nodejs";
export const maxDuration = 60;

const PAPERS_DIR = "content/papers";
const COVERS_DIR = `public${COVER_BASE}`;

const slugify = (s: string) =>
  String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);

const mdPath = (slug: string) => `${PAPERS_DIR}/${slug}.md`;
const coverPath = (slug: string) => `${COVERS_DIR}/${slug}.png`;

function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  if (!canWrite()) {
    return fail("Saving is not configured. Set GITHUB_TOKEN so Studio can commit.", 403);
  }

  const body = await req.json().catch(() => null);
  if (!body) return fail("Malformed request.");

  const title = String(body.title ?? "").trim();
  if (!title) return fail("A title is required.");

  const slug = slugify(body.slug || title);
  if (!slug) return fail("That title does not produce a usable slug — add some letters.");

  const originalSlug = body.originalSlug ? slugify(body.originalSlug) : "";

  // Renaming onto an existing paper would silently overwrite it.
  if (slug !== originalSlug && paperBySlug(slug)) {
    return fail(`A whitepaper with the slug "${slug}" already exists.`, 409);
  }

  let rendered;
  try {
    rendered = await coverFromUrl(String(body.pdfUrl ?? ""));
  } catch (e) {
    if (e instanceof PdfError) return fail(e.message, 422);
    throw e;
  }

  const data = {
    title,
    pdfUrl: String(body.pdfUrl).trim(),
    cover: `${COVER_BASE}/${slug}.png`,
    pages: rendered.pages,
    date: String(body.date || "").slice(0, 10) || new Date().toISOString().slice(0, 10),
    status: body.status === "published" ? "published" : "draft",
    summary: String(body.summary ?? "").trim()
  };

  const deletes =
    originalSlug && originalSlug !== slug ? [mdPath(originalSlug), coverPath(originalSlug)] : [];

  try {
    const result = await commit(
      [
        { path: mdPath(slug), data: matter.stringify("", data) },
        { path: coverPath(slug), data: rendered.cover }
      ],
      deletes,
      `Studio: ${originalSlug ? "update" : "add"} whitepaper "${title}"`
    );
    return NextResponse.json({ slug, pages: rendered.pages, ...result });
  } catch (e) {
    if (e instanceof StoreError) return fail(e.message, 502);
    throw e;
  }
}

export async function DELETE(req: Request) {
  if (!canWrite()) return fail("Saving is not configured.", 403);

  const body = await req.json().catch(() => null);
  const slug = slugify(body?.slug ?? "");
  if (!slug) return fail("A slug is required.");
  if (!paperBySlug(slug)) return fail("No such whitepaper.", 404);

  try {
    const result = await commit([], [mdPath(slug), coverPath(slug)], `Studio: remove whitepaper "${slug}"`);
    return NextResponse.json({ slug, ...result });
  } catch (e) {
    if (e instanceof StoreError) return fail(e.message, 502);
    throw e;
  }
}

/* Studio calls this to preview a cover before committing. */
export async function PUT(req: Request) {
  if (!canWrite()) return fail("Studio is not configured.", 403);

  const body = await req.json().catch(() => null);
  try {
    const { cover, pages } = await coverFromUrl(String(body?.pdfUrl ?? ""));
    return NextResponse.json({
      pages,
      preview: `data:image/png;base64,${cover.toString("base64")}`,
      mode: usingGit() ? "git" : "disk"
    });
  } catch (e) {
    if (e instanceof PdfError) return fail(e.message, 422);
    throw e;
  }
}
