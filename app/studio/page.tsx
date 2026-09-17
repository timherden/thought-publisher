import { allPapers, allPosts, SERIES } from "@/lib/content";
import { canWrite } from "@/lib/store";
import { StudioClient } from "./StudioClient";

/* Studio reads content on every request — a save must show up immediately. */
export const dynamic = "force-dynamic";

export default function StudioPage() {
  return (
    <StudioClient
      posts={allPosts()}
      papers={allPapers()}
      series={SERIES.map((s) => s.name)}
      canWrite={canWrite()}
    />
  );
}
