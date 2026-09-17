import fs from "node:fs";
import path from "node:path";

/* Where a Studio save goes.

   The site has no database: content is markdown in the repo and a commit is a publish.
   Studio keeps that contract from a read-only serverless filesystem by committing through
   the GitHub API — one commit per save, containing both the markdown and the rendered
   cover, which triggers a Vercel rebuild.

   In development there is a working tree right here, so we write to it directly and skip
   the round trip. Set GITHUB_TOKEN locally to exercise the real path. */

export type FileWrite = { path: string; data: Buffer | string };

export type SaveResult = { mode: "git" | "disk"; commit?: string; url?: string };

const REPO = process.env.GITHUB_REPO ?? "timherden/thought-publisher";
const BRANCH = process.env.GITHUB_BRANCH ?? "main";

export const usingGit = () => Boolean(process.env.GITHUB_TOKEN);

export function canWrite() {
  return usingGit() || process.env.NODE_ENV === "development";
}

export class StoreError extends Error {}

/* ── GitHub ──────────────────────────────────────────────── */

async function gh(endpoint: string, init: RequestInit = {}) {
  const res = await fetch(`https://api.github.com/repos/${REPO}${endpoint}`, {
    ...init,
    cache: "no-store",
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "x-github-api-version": "2022-11-28",
      ...(init.body ? { "content-type": "application/json" } : {})
    }
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 401 || res.status === 403) {
      throw new StoreError("GitHub rejected the token — check GITHUB_TOKEN and its scopes.");
    }
    if (res.status === 404) {
      throw new StoreError(`GitHub could not find ${REPO} (or the token cannot see it).`);
    }
    throw new StoreError(`GitHub API ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

/* Blobs → tree → commit → move the ref. The Contents API writes one file per commit;
   a whitepaper is two files (markdown + cover) and they must land together or a rebuild
   can publish a page whose cover does not exist yet. */
async function commitToGit(
  writes: FileWrite[],
  deletes: string[],
  message: string
): Promise<SaveResult> {
  const ref = await gh(`/git/ref/heads/${BRANCH}`);
  const headSha = ref.object.sha;
  const head = await gh(`/git/commits/${headSha}`);

  const blobs = await Promise.all(
    writes.map(async (w) => {
      const isBuffer = Buffer.isBuffer(w.data);
      const blob = await gh("/git/blobs", {
        method: "POST",
        body: JSON.stringify({
          content: isBuffer ? (w.data as Buffer).toString("base64") : w.data,
          encoding: isBuffer ? "base64" : "utf-8"
        })
      });
      return { path: w.path, mode: "100644" as const, type: "blob" as const, sha: blob.sha };
    })
  );

  /* A null sha in a tree entry removes the path — but naming a path that is not in the
     base tree fails the whole request, so drop the ones that are already gone. */
  const present = await Promise.all(
    deletes.map(async (p) => {
      /* HEAD, not GET: the Contents API refuses to return JSON for a blob over 1 MB,
         and a cover PNG can be. A GET here would report a large file as missing and
         quietly orphan it. */
      const res = await fetch(
        `https://api.github.com/repos/${REPO}/contents/${encodeURI(p)}?ref=${BRANCH}`,
        {
          method: "HEAD",
          cache: "no-store",
          headers: {
            accept: "application/vnd.github+json",
            authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            "x-github-api-version": "2022-11-28"
          }
        }
      );
      return res.ok ? p : null;
    })
  );

  const removals = present
    .filter((p): p is string => p !== null)
    .map((p) => ({ path: p, mode: "100644" as const, type: "blob" as const, sha: null }));

  const entries = [...blobs, ...removals];
  if (!entries.length) throw new StoreError("Nothing to commit.");

  const tree = await gh("/git/trees", {
    method: "POST",
    body: JSON.stringify({ base_tree: head.tree.sha, tree: entries })
  });

  const commit = await gh("/git/commits", {
    method: "POST",
    body: JSON.stringify({ message, tree: tree.sha, parents: [headSha] })
  });

  await gh(`/git/refs/heads/${BRANCH}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha })
  });

  return {
    mode: "git",
    commit: String(commit.sha).slice(0, 7),
    url: `https://github.com/${REPO}/commit/${commit.sha}`
  };
}

/* ── Disk ────────────────────────────────────────────────── */

function commitToDisk(writes: FileWrite[], deletes: string[]): SaveResult {
  for (const w of writes) {
    const abs = path.join(process.cwd(), w.path);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, w.data);
  }
  for (const p of deletes) {
    const abs = path.join(process.cwd(), p);
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  }
  return { mode: "disk" };
}

/* ── Entry point ─────────────────────────────────────────── */

export async function commit(
  writes: FileWrite[],
  deletes: string[],
  message: string
): Promise<SaveResult> {
  if (usingGit()) return commitToGit(writes, deletes, message);
  if (process.env.NODE_ENV === "development") return commitToDisk(writes, deletes);
  throw new StoreError(
    "Saving is not configured. Set GITHUB_TOKEN so Studio can commit to the repo."
  );
}
