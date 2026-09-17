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
      api/studio/save/route.ts    writes a post back to content/posts
    content/
      posts/*.md                  essays: frontmatter + markdown body
      papers/*.md                 whitepapers: frontmatter only
      series.json                 the three collections
    lib/
      content.ts                  reading, parsing, and everything derived
      blocks.tsx                  markdown blocks → design-system components
      ds/                         the design system (components + tokens)
    public/pdfs/                  the whitepaper PDFs, named by slug

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

`content/papers/<slug>.md` is frontmatter only (no body). The download links to
`public/pdfs/<slug>.pdf`. No gate, no email capture, no API route.

Whitepaper frontmatter is edited by hand; Studio lists them read-only.

## Studio

`/studio` and `/api/studio/*` sit behind basic auth in `middleware.ts`.

    STUDIO_PASSWORD=…        required in production; without it /studio returns 404
    STUDIO_USER=tim          optional, defaults to tim
    STUDIO_WRITES=on         allows the save route to write to disk

Saving writes markdown to `content/posts/`. That works locally and on any host with a
writable filesystem; it does **not** work on Vercel's serverless runtime, where the
filesystem is read-only. Two ways to live with that:

1. **Edit locally, commit, push.** Studio is a local tool. Production runs with
   `STUDIO_PASSWORD` unset so `/studio` 404s. This is the default and needs no secrets.
2. **Commit through the GitHub API.** Replace the body of `app/api/studio/save/route.ts`
   with a `PUT /repos/:owner/:repo/contents/:path` call using a fine-grained PAT in
   `GITHUB_TOKEN`. Studio then works from anywhere and each save is a commit, which
   triggers a rebuild.

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
3. Leave environment variables empty for the public site. Add `STUDIO_PASSWORD` only if you
   want Studio reachable in production.
4. Point the domain.

Every page is static. A commit to `content/` rebuilds the affected pages.

## Deliberately absent

No newsletter, no email capture, no comments, no analytics, no RSS, no database. Each one
adds a runtime dependency to a site that otherwise ships as files. Add one when there is a
reason.

---

Written independently. Not endorsed by, or affiliated with, any employer.
