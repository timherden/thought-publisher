"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Callout, Card, Eyebrow, Icon, Input } from "@/lib/ds";
import type { Paper } from "@/lib/papers";

/* Whitepaper management. A paper is a title plus a public PDF URL; everything else —
   the cover, the page count — is derived server-side from the PDF itself. */

type Draft = {
  slug: string;
  title: string;
  pdfUrl: string;
  summary: string;
  date: string;
  status: "published" | "draft";
  isNew: boolean;
};

const LABEL: React.CSSProperties = {
  font: "var(--type-eyebrow)",
  letterSpacing: "var(--tracking-eyebrow)",
  textTransform: "uppercase",
  color: "var(--ink-500)",
  display: "block",
  marginBottom: 8
};

const AREA: React.CSSProperties = {
  width: "100%",
  font: "var(--type-body-s)",
  color: "var(--ink-900)",
  background: "var(--paper)",
  border: "1px solid var(--border-hairline)",
  borderRadius: 3,
  padding: "10px 12px",
  resize: "vertical",
  outlineOffset: 2
};

const blank = (): Draft => ({
  slug: "",
  title: "",
  pdfUrl: "",
  summary: "",
  date: new Date().toISOString().slice(0, 10),
  status: "draft",
  isNew: true
});

const toDraft = (p: Paper): Draft => ({
  slug: p.slug,
  title: p.title,
  pdfUrl: p.pdfUrl,
  summary: p.summary,
  date: p.date,
  status: p.status,
  isNew: false
});

export function PapersPanel({
  papers,
  canWrite,
  loadError
}: {
  papers: Paper[];
  canWrite: boolean;
  loadError: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<Draft>(blank());
  const [selected, setSelected] = useState("");
  const [open, setOpen] = useState(false);

  const [busy, setBusy] = useState<"" | "preview" | "save" | "delete">("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  // Cover rendered from the URL but not yet committed.
  const [preview, setPreview] = useState<{ src: string; pages: number } | null>(null);

  const patch = (p: Partial<Draft>) => {
    setForm((f) => ({ ...f, ...p }));
    setError("");
    setNote("");
    if ("pdfUrl" in p) setPreview(null);
  };

  function editPaper(p: Paper) {
    setForm(toDraft(p));
    setSelected(p.slug);
    setPreview(null);
    setError("");
    setNote("");
    setOpen(true);
  }

  function newPaper() {
    setForm(blank());
    setSelected("");
    setPreview(null);
    setError("");
    setNote("");
    setOpen(true);
  }

  async function call(method: "POST" | "PUT" | "DELETE", body: unknown) {
    const res = await fetch("/api/studio/papers", {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error ?? `${method} failed (${res.status})`);
    return json;
  }

  /* Renders page 1 without writing anything, so a wrong URL costs nothing. */
  async function checkPdf() {
    setBusy("preview");
    setError("");
    setNote("");
    try {
      const json = await call("PUT", { pdfUrl: form.pdfUrl });
      setPreview({ src: json.preview, pages: json.pages });
      setNote(`Read ${json.pages} ${json.pages === 1 ? "page" : "pages"}. This is the cover.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read that PDF.");
    } finally {
      setBusy("");
    }
  }

  async function save() {
    setBusy("save");
    setError("");
    setNote("");
    try {
      const json = await call("POST", { ...form, originalSlug: form.isNew ? "" : selected });
      setForm((f) => ({ ...f, slug: json.slug, isNew: false }));
      setSelected(json.slug);
      setPreview(null);
      setNote(
        `Saved to Airtable. ${json.pages} ${json.pages === 1 ? "page" : "pages"}, cover uploaded — live now.`
      );
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setBusy("");
    }
  }

  async function remove() {
    if (!confirm(`Delete "${form.title}"? This removes its Airtable record and cover.`)) return;
    setBusy("delete");
    setError("");
    try {
      await call("DELETE", { slug: selected });
      setOpen(false);
      setForm(blank());
      setSelected("");
      setNote(`Deleted ${selected}.`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setBusy("");
    }
  }

  const canSave = Boolean(form.title.trim() && form.pdfUrl.trim()) && canWrite && !busy;

  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
        <Eyebrow tone="muted">All whitepapers</Eyebrow>
        <div style={{ marginLeft: "auto" }}>
          <Button variant="secondary" size="sm" icon="plus" iconPosition="left" onClick={newPaper}>
            New whitepaper
          </Button>
        </div>
      </div>

      {loadError && (
        <div style={{ margin: "16px 0" }}>
          <Callout tone="caution" title="Could not read the base">
            {loadError}
          </Callout>
        </div>
      )}

      {papers.length === 0 && !loadError && !open && (
        <p style={{ font: "var(--type-body-s)", color: "var(--ink-500)", padding: "24px 0" }}>
          No whitepapers yet. Add one with its public PDF link.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column" }}>
        {papers.map((p) => (
          <button
            key={p.slug}
            onClick={() => editPaper(p)}
            style={{
              all: "unset",
              display: "flex",
              gap: 16,
              alignItems: "center",
              flexWrap: "wrap",
              padding: "14px 12px",
              margin: "0 -12px",
              borderBottom: "1px solid var(--border-hairline)",
              cursor: "pointer",
              background: p.slug === selected ? "var(--paper-cool)" : "transparent"
            }}
          >
            <span
              style={{
                flex: "0 0 8px",
                width: 8,
                height: 8,
                borderRadius: 999,
                background: p.status === "published" ? "var(--teal-500)" : "var(--amber-500)"
              }}
            />
            {p.cover && (
              <img
                src={p.cover}
                alt=""
                style={{
                  flex: "0 0 auto",
                  width: 34,
                  height: 44,
                  objectFit: "cover",
                  objectPosition: "top center",
                  border: "1px solid var(--border-hairline)",
                  background: "var(--paper)"
                }}
              />
            )}
            <span style={{ flex: "1 1 260px", minWidth: 0 }}>
              <span style={{ font: "var(--type-body-s)", color: "var(--ink-900)", display: "block" }}>
                {p.title}
              </span>
              <span
                style={{
                  font: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--ink-300)",
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                {p.pdfUrl}
              </span>
            </span>
            <span style={{ flex: "0 0 auto", font: "var(--font-mono)", fontSize: 12, color: "var(--ink-500)" }}>
              {p.pages} {p.pages === 1 ? "page" : "pages"}
            </span>
            <span
              style={{
                flex: "0 0 74px",
                font: "var(--font-mono)",
                fontSize: 12,
                color: "var(--ink-500)",
                textAlign: "right"
              }}
            >
              {p.status === "published" ? "Live" : "Draft"}
            </span>
          </button>
        ))}
      </div>

      {open && (
        <div style={{ display: "flex", gap: 40, flexWrap: "wrap", marginTop: 40 }}>
          <div style={{ flex: "1 1 380px", minWidth: 0 }}>
            <Card variant="hairline" padding="lg">
              <Eyebrow tone="ink">{form.isNew ? "New whitepaper" : `Editing ${form.slug}`}</Eyebrow>

              <div style={{ marginTop: 24 }}>
                <Input
                  label="Title"
                  value={form.title}
                  placeholder="The Wiring Behind the Model"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ title: e.target.value })}
                />
              </div>

              <div style={{ marginTop: 20 }}>
                <Input
                  label="Public PDF URL"
                  value={form.pdfUrl}
                  placeholder="https://your-bucket.s3.eu-central-1.amazonaws.com/paper.pdf"
                  hint="The object must be publicly readable. Page 1 becomes the cover."
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ pdfUrl: e.target.value })}
                />
                <div style={{ marginTop: 12 }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon="eye"
                    iconPosition="left"
                    disabled={!form.pdfUrl.trim() || busy === "preview"}
                    onClick={checkPdf}
                  >
                    {busy === "preview" ? "Reading PDF…" : "Check PDF & preview cover"}
                  </Button>
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <label style={LABEL}>Summary — optional</label>
                <textarea
                  rows={3}
                  value={form.summary}
                  onChange={(e) => patch({ summary: e.target.value })}
                  placeholder="One or two sentences shown under the title."
                  style={AREA}
                />
              </div>

              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 20 }}>
                <div style={{ flex: "1 1 160px" }}>
                  <Input
                    label="Date"
                    value={form.date}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ date: e.target.value })}
                  />
                </div>
                <div style={{ flex: "1 1 160px" }}>
                  <label style={LABEL}>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => patch({ status: e.target.value as Draft["status"] })}
                    style={{ ...AREA, height: 40, padding: "0 10px" }}
                  >
                    <option value="draft">Draft — not public</option>
                    <option value="published">Published — live</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  alignItems: "center",
                  marginTop: 28,
                  paddingTop: 20,
                  borderTop: "1px solid var(--border-hairline)"
                }}
              >
                <Button variant="primary" icon="check" iconPosition="left" disabled={!canSave} onClick={save}>
                  {busy === "save" ? "Saving…" : form.isNew ? "Create whitepaper" : "Save changes"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                {!form.isNew && (
                  <div style={{ marginLeft: "auto" }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="trash-2"
                      iconPosition="left"
                      disabled={busy === "delete"}
                      onClick={remove}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>

              {error && (
                <div style={{ marginTop: 20 }}>
                  <Callout tone="caution" title="That did not work">
                    {error}
                  </Callout>
                </div>
              )}
              {note && !error && (
                <div style={{ marginTop: 20 }}>
                  <Callout tone="takeaway" title="Done">
                    {note}
                  </Callout>
                </div>
              )}
              {!canWrite && (
                <div style={{ marginTop: 20 }}>
                  <Callout tone="caution" title="Saving is off">
                    Set AIRTABLE_TOKEN so Studio can write to the base.
                  </Callout>
                </div>
              )}
            </Card>
          </div>

          <div style={{ flex: "0 1 300px" }}>
            <Eyebrow tone="muted">Cover</Eyebrow>
            <div
              style={{
                marginTop: 14,
                border: "1px solid var(--border-hairline)",
                background: "var(--paper-cool)",
                aspectRatio: "1 / 1.294",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden"
              }}
            >
              {preview ? (
                <img
                  src={preview.src}
                  alt="First page"
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
                />
              ) : !form.isNew && form.slug ? (
                <img
                  src={`/covers/${form.slug}.png`}
                  alt="Current cover"
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
                />
              ) : (
                <div style={{ textAlign: "center", padding: 24 }}>
                  <Icon name="file-text" size={26} color="var(--ink-300)" />
                  <p style={{ font: "var(--type-caption)", color: "var(--ink-500)", margin: "12px 0 0" }}>
                    Paste a PDF URL and check it to see the first page.
                  </p>
                </div>
              )}
            </div>
            {preview && (
              <p style={{ font: "var(--type-caption)", color: "var(--ink-500)", margin: "10px 0 0" }}>
                Not saved yet — this is committed when you save.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
