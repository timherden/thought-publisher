# thought-publisher

Tim Herden's independent writing: essays and long-form whitepapers, published as a static
Next.js site. Content lives in the repo as markdown, so a commit is a publish.

## Run it

    npm install
    npm run dev

Open http://localhost:3000. Studio is at /studio and is open in development.

## Structure

    app/
      page.tsx                    home — pinned essay, series, recent, whitepapers
      writing/page.tsx            archive (topic + series filters, search)
      writing/[slug]/page.tsx     article — TOC, margin note, series siblings
      whitepapers/page.tsx        library
      whitepapers/[slug]/page.tsx detail + direct PDF download
      about/page.tsx
      studio/                     authoring UI (protected)
      api/studio/save/route.ts    writes an essay back to content/posts
      api/studio/papers/route.ts  whitepaper CRUD + cover rendering
    content/
      posts/*.md                  essays: frontmatter + markdown body
      papers/*.md                 whitepapers: frontmatter only
      series.json                 the three collections
    lib/
      content.ts                  reading, parsing, and everything derived
      blocks.tsx                  markdown blocks → design-system components
      pdf.ts                      fetch a PDF, render page 1 to PNG (mupdf)
      store.ts                    where a save goes: GitHub commit, or disk in dev
      ds/                         the design system (components + tokens)
    public/covers/                rendered first pages, committed by Studio

## Content

Frontmatter for an essay:

    ---
    title: "Most integration projects do not fail in the code"
    tag: "Integration"
    series: "Integration readiness"
    date: 2026-08-14
    status: published        # published | draft
    pinned: true
    standfirst: "The expensive mistakes are made in the weeks before…"
    sourceLine: "Author's own observations, 2019–2026."
    paperSlug: "readiness"
    paperNote: "The long version, with the workshop agenda."
    ---

Reading time, the table of contents, series counts and related essays are all derived in
`lib/content.ts` — do not put them in frontmatter.

Drafts are excluded from `generateStaticParams`, so a draft has no public URL at all. It is
still listed in Studio.

### Markdown subset

Five block types, separated by blank lines. Each maps onto one design-system treatment:

| Syntax | Renders as |
|---|---|
| plain paragraph | body copy |
| `## Heading` | section heading, and a TOC entry |
| `> quoted line` | `PullQuote`, amber accent |
| `- item` (consecutive lines) | teal-dot list |
| `!! Title :: text` | `Callout`, takeaway tone |

This is deliberately not a full markdown pipeline. The subset is the contract between the
Studio editor and the article page — if you add a block type, add it in `mdToBlocks`,
`Blocks`, and the Studio hint text together.

## Whitepapers

A whitepaper is a **title and a public PDF URL**. The PDF itself lives in an S3 bucket (or
any public HTTPS host) — it is never committed to this repo.

`content/papers/<slug>.md` is frontmatter only:

    ---
    title: "The Wiring Behind the Model"
    pdfUrl: "https://bucket.s3.eu-central-1.amazonaws.com/wiring.pdf"
    cover: /covers/wiring-behind-the-model.png
    pages: 4
    date: '2026-09-17'
    status: published        # published | draft
    summary: "Nine things that decide whether AI actually works."
    ---

`cover` and `pages` are **derived, not typed**. When you save in Studio the server fetches
the PDF once, renders page 1 with mupdf, and commits the PNG to `public/covers/` in the
same commit as the markdown. The gallery then shows a plain `<img>`: no PDF work in the
browser, and no dependency on the bucket allowing cross-origin reads.

Manage them at `/studio` → Whitepapers. Paste a URL, hit **Check PDF** to see the cover
before committing, then save. No gate, no email capture.

### The bucket

The object must be publicly readable — Studio tells you if it gets a 403. CORS does **not**
need to be configured: the fetch happens server-side, and the browser only ever loads the
rendered cover and the direct download link.

## Studio

`/studio` and `/api/studio/*` sit behind basic auth in `middleware.ts`.

    STUDIO_PASSWORD=…        required in production; without it /studio returns 404
    STUDIO_USER=tim          optional, defaults to tim
    GITHUB_TOKEN=…           required in production; lets Studio commit
    GITHUB_REPO=timherden/thought-publisher    optional
    GITHUB_BRANCH=main                          optional

### How saving works

Vercel's filesystem is read-only, so Studio cannot write markdown where the site is
served. Instead **a save is a commit**: `lib/store.ts` writes the files through the GitHub
Git Data API — blobs, tree, commit, move the ref — so the markdown and the cover land in a
single atomic commit. That push triggers a Vercel rebuild and the page is live in about a
minute.

In development there is a real working tree, so saves write straight to disk and skip the
round trip. Set `GITHUB_TOKEN` locally to exercise the production path instead.

`GITHUB_TOKEN` should be a fine-grained PAT scoped to this repo with **Contents: read and
write**. It is the one secret that can change the site, so keep it to that one repo.

## Design system

`lib/ds/` is a copy of the Tim Herden design system: React components plus CSS custom
property tokens, imported once in `app/globals.css`. Style against `var(--*)`; do not
introduce colours, type sizes or radii that are not in `lib/ds/tokens/`.

Two changes were made during the port:

- `Icon` uses `lucide-react` instead of the CDN UMD build. Stroke width stays 1.5.
- Components carry `"use client"` because they use hooks for hover and press states.

Fonts come from the Google Fonts `@import` at the top of `lib/ds/tokens/fonts.css`. Moving
them to `next/font` is a reasonable optimisation and changes nothing visually.

## Deploy

1. Push to `main`.
2. Import the repo on Vercel. Framework preset Next.js, no build configuration needed.
3. Leave environment variables empty for the public site. To use Studio in production set
   `STUDIO_PASSWORD` (it 404s without one) and `GITHUB_TOKEN` (saving is refused without
   one).
4. Point the domain.

Every page is static. A commit to `content/` rebuilds the affected pages.

## Deliberately absent

No newsletter, no email capture, no comments, no analytics, no RSS, no database. Each one
adds a runtime dependency to a site that otherwise ships as files. Add one when there is a
reason.

Studio is the one exception, and it earns it by writing **into the repo** rather than into
a database: the site still builds from files alone, and Studio could disappear tomorrow
without taking the content with it.

---

Written independently. Not endorsed by, or affiliated with, any employer.
