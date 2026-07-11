import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import OtherContent from "@/components/OtherContent";
import SplitPage from "@/components/SplitPage";
import { getFitnessEntry, type FitnessEntry } from "@/lib/notion-other";

type FitnessDetailProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Running",
  description: "Fitness entry by Elias Lankinen.",
};

export default async function FitnessDetail({ params }: FitnessDetailProps) {
  const { id } = await params;
  let entry: FitnessEntry | null = null;

  try {
    entry = await getFitnessEntry(id);
  } catch (error) {
    console.error("Failed to load Notion fitness entry", error);
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
              <Link className="font-mono text-xs uppercase tracking-[0.12em] text-white/42 transition hover:text-lime-100/72" href="/hobbies/running">
                Hobbies / Running
              </Link>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                {entry.category ? (
                  <span className="border border-lime-100/20 bg-lime-100/10 px-2 py-1 font-mono text-xs uppercase tracking-[0.12em] text-lime-100/76">
                    {entry.category}
                  </span>
                ) : null}
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-lime-100/62">{formatDate(entry.date)}</p>
              </div>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl">{entry.title}</h1>
              {entry.description ? <p className="mt-5 max-w-sm text-base leading-7 text-white/62">{entry.description}</p> : null}
            </>
          }
          right={
            <article className="border border-white/10 bg-white/[0.055] p-4 backdrop-blur sm:p-6">
              {entry.imageUrl ? (
                <div aria-label={entry.title} className="mb-6 min-h-80 border border-white/10 bg-black/24 bg-cover bg-center" role="img" style={{ backgroundImage: `url(${entry.imageUrl})` }} />
              ) : null}
              <OtherContent blocks={entry.content ?? []} />
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
