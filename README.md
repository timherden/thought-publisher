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
      covers/[file]/route.ts      serves a cover, CDN-cached (see Whitepapers)
    content/
      posts/*.md                  essays: frontmatter + markdown body
      series.json                 the three collections
    lib/
      content.ts                  essays: reading, parsing, everything derived
      papers.ts                   whitepapers, read from Airtable
      airtable.ts                 the Airtable REST client
      blocks.tsx                  markdown blocks → design-system components
      pdf.ts                      fetch a PDF, render page 1 to PNG (mupdf)
      store.ts                    where an essay save goes: commit, or disk in dev
      ds/                         the design system (components + tokens)

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

A whitepaper is a **title and a public PDF URL**. Metadata lives in **Airtable**; the PDF
stays in S3 and the base holds the link. Neither is in this repo.

Base `Thought Publisher`, table `Whitepapers`:

| Field | Type | Notes |
|---|---|---|
| Title | single line text | the heading |
| Slug | single line text | URL segment; derived from the title if blank |
| PDF URL | url | public https link to the PDF in S3 |
| Cover | attachment | page 1, rendered on save — **do not edit by hand** |
| Pages | number | read from the PDF on save |
| Summary | long text | optional |
| Published Date | date (ISO) | sorted newest first |
| Status | single select | `Draft` (no public URL) or `Published` |

`Cover` and `Pages` are **derived, not typed**. On save the server fetches the PDF once,
renders page 1 with mupdf, and uploads the PNG to the record's Cover field.

Manage them at `/studio` → Whitepapers. Paste a URL, hit **Check PDF** to see the cover
before saving. No gate, no email capture.

### Why covers are proxied

Airtable's attachment URLs **expire after a couple of hours**, so the site cannot link to
them — images would work in Studio and then quietly break for visitors. `app/covers/[file]`
resolves a fresh URL per request and serves the bytes from our own origin with a long
`s-maxage`, so the CDN holds the image and Airtable is hit once per edge region. Reading a
paper's cover is therefore always a URL on this site, never an Airtable URL.

### Publishing is instant

Reads go through Next's fetch cache tagged `papers`, so pages are served like static files.
A save calls `revalidateTag("papers")` and the change is live immediately — no rebuild. A
five-minute `revalidate` is a safety net so edits made directly in Airtable still appear.

### The bucket

The PDF object must be publicly readable — Studio tells you if it gets a 403. CORS does
**not** need configuring: the fetch happens server-side, and the browser only ever loads
the proxied cover and the direct download link.

## Studio

`/studio` and `/api/studio/*` sit behind basic auth in `middleware.ts`.

    STUDIO_PASSWORD=…        required in production; without it /studio returns 404
    STUDIO_USER=tim          optional, defaults to tim

    AIRTABLE_TOKEN=…         whitepapers: PAT with data.records:read + :write
    AIRTABLE_BASE_ID=…       optional, defaults to the Thought Publisher base
    AIRTABLE_TABLE=…         optional, defaults to Whitepapers

    GITHUB_TOKEN=…           essays only; lets Studio commit markdown
    GITHUB_REPO=timherden/thought-publisher    optional
    GITHUB_BRANCH=main                          optional

An Airtable PAT carries an explicit **list of bases it may touch**. A token that omits the
Thought Publisher base returns 403 even with the right scopes — add the base under Access
when you create it.

Whitepapers need only `AIRTABLE_TOKEN`; essays need only `GITHUB_TOKEN`. Each half of
Studio works without the other.

### How saving works

**Whitepapers** are written straight to Airtable and published by cache invalidation —
immediate, no rebuild. See above.

**Essays** are markdown in this repo, and Vercel's filesystem is read-only, so Studio
cannot write them where the site is served. For those, **a save is a commit**:
`lib/store.ts` writes through the GitHub Git Data API — blobs, tree, commit, move the ref —
in one atomic commit, which triggers a rebuild. The essay is live in about a minute.

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
   `STUDIO_PASSWORD` (it 404s without one), plus `AIRTABLE_TOKEN` for whitepapers and
   `GITHUB_TOKEN` for essays.
4. Point the domain.

Every page is static. A commit to `content/` rebuilds the affected pages.

## Deliberately absent

No newsletter, no email capture, no comments, no analytics, no RSS. Each one adds a runtime
dependency to a site that otherwise ships as files. Add one when there is a reason.

Whitepapers are the one place that reaches out at request time, and the cache tag keeps
that off the critical path: pages are served like static files and a read failure costs the
list, not the site. Essays stay markdown in the repo, where version history is worth
having.

---

Written independently. Not endorsed by, or affiliated with, any employer.
