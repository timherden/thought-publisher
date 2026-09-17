import { SectionHeading } from "@/lib/ds";
import { publishedPapers } from "@/lib/papers";
import { PaperCard } from "@/components/PaperCard";

export default async function WhitepapersPage() {
  const papers = await publishedPapers();

  return (
    <section style={{ maxWidth: 1160, margin: "0 auto", padding: "64px 32px 0" }}>
      <SectionHeading
        eyebrow="Library"
        band="mint"
        level={1}
        standfirst="Long-form guides as PDFs. Free, printable, and sourced — no email required."
      >
        Whitepapers
      </SectionHeading>

      {papers.length === 0 ? (
        <p
          style={{
            font: "var(--type-body)",
            color: "var(--ink-500)",
            marginTop: 48,
            paddingTop: 32,
            borderTop: "1px solid var(--border-hairline)"
          }}
        >
          Nothing published yet.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 28,
            marginTop: 48
          }}
        >
          {papers.map((paper) => (
            <PaperCard key={paper.slug} paper={paper} />
          ))}
        </div>
      )}
    </section>
  );
}
