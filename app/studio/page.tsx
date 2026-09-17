import { allPosts, SERIES } from "@/lib/content";
import { papersForStudio } from "@/lib/papers";
import { canWrite } from "@/lib/store";
import { configured } from "@/lib/airtable";
import { StudioClient } from "./StudioClient";

/* Studio reads content on every request — a save must show up immediately. */
export const dynamic = "force-dynamic";

export default async function StudioPage() {
  const { papers, error } = await papersForStudio();
  return (
    <StudioClient
      posts={allPosts()}
      papers={papers}
      papersError={error}
      series={SERIES.map((s) => s.name)}
      canWrite={canWrite()}
      papersWritable={configured()}
    />
  );
}
