import { allPapers, allPosts, PDF_BASE, SERIES } from "@/lib/content";
import { StudioClient } from "./StudioClient";

/* Studio reads from disk on every request — a save must show up immediately. */
export const dynamic = "force-dynamic";

export default function StudioPage() {
  return (
    <StudioClient
      posts={allPosts()}
      papers={allPapers()}
      series={SERIES.map((s) => s.name)}
      pdfBase={PDF_BASE}
      canWrite={process.env.STUDIO_WRITES === "on" || process.env.NODE_ENV === "development"}
    />
  );
}
