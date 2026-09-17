import { SectionHeading } from "@/lib/ds";
import { publishedPosts, SERIES } from "@/lib/content";
import { WritingIndex } from "./WritingIndex";

export default async function WritingPage({
  searchParams
}: {
  searchParams: Promise<{ series?: string; tag?: string }>;
}) {
  const sp = await searchParams;
  const posts = publishedPosts();
  const tags = Array.from(new Set(posts.map((p) => p.tag)));

  return (
    <section style={{ maxWidth: 1160, margin: "0 auto", padding: "64px 32px 0" }}>
      <SectionHeading eyebrow="Archive" band="mint" level={1} standfirst="Every published essay, newest first.">
        Writing
      </SectionHeading>
      <WritingIndex
        posts={posts}
        tags={tags}
        series={SERIES.map((s) => s.name)}
        initialSeries={sp.series ?? "All"}
        initialTag={sp.tag ?? "All"}
      />
    </section>
  );
}
