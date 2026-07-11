import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import InvestingContent from "@/components/InvestingContent";
import SplitPage from "@/components/SplitPage";
import { getMarketAnalysisEntry, type MarketAnalysis } from "@/lib/notion-investing";

type MarketAnalysisDetailProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Market Analysis",
  description: "Market analysis by Elias Lankinen.",
};

export default async function MarketAnalysisDetail({ params }: MarketAnalysisDetailProps) {
  const { id } = await params;
  let entry: MarketAnalysis | null = null;

  try {
    entry = await getMarketAnalysisEntry(id);
  } catch (error) {
    console.error("Failed to load Notion market analysis", error);
  }

  if (!entry) {
    notFound();
  }

  return (
    <main className="relative h-dvh overflow-hidden bg-[#050706] px-3 py-3 text-white sm:px-4 sm:py-4">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_15%_16%,rgba(135,171,105,0.2),transparent_22rem),radial-gradient(circle_at_84%_14%,rgba(91,118,137,0.22),transparent_25rem),linear-gradient(115deg,#050706_0%,#08100c_44%,#151f11_80%,#050706_100%)]" />
      <div className="fixed inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.86),rgba(0,0,0,0.34)_48%,rgba(0,0,0,0.76)),radial-gradient(circle_at_48%_118%,rgba(96,88,53,0.3),transparent_22rem)]" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col">
        <Header />

        <SplitPage
          left={
            <>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime-100/68">Other / Investing</p>
              <p className="mt-6 font-mono text-xs uppercase tracking-[0.12em] text-lime-100/62">{formatDate(entry.date)}</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl">{entry.name}</h1>
              {entry.description ? <p className="mt-5 max-w-sm text-base leading-7 text-white/62">{entry.description}</p> : null}
              {entry.link ? (
                <a
                  className="mt-6 inline-block font-mono text-xs uppercase tracking-[0.12em] text-lime-100/62 transition hover:text-lime-100"
                  href={entry.link}
                  rel="noreferrer"
                  target="_blank"
                >
                  External link
                </a>
              ) : null}
            </>
          }
          right={
            <article className="border border-white/10 bg-white/[0.055] p-4 backdrop-blur sm:p-6">
              <InvestingContent blocks={entry.content ?? []} />
            </article>
          }
        />
      </div>
    </main>
  );
}

function formatDate(value: string | null) {
  if (!value) {
    return "Undated";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}
