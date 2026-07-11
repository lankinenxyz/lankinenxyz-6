import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import SplitPage from "@/components/SplitPage";
import { getFitnessEntries, type FitnessEntry } from "@/lib/notion-other";

export const metadata: Metadata = {
  title: "Running | lankinen.xyz",
  description: "Running logs by Elias Lankinen.",
};

export default async function Fitness() {
  let entries: FitnessEntry[] = [];
  let errorMessage = "";

  try {
    entries = await getFitnessEntries();
  } catch (error) {
    console.error("Failed to load Notion fitness data", error);
    errorMessage = "Fitness entries are temporarily unavailable.";
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
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime-100/68">Hobbies / Running</p>
              <p className="mt-6 max-w-sm text-base leading-7 text-white/62 sm:text-lg sm:leading-8">
                I don’t enjoy running, but I do it to stay healthy. I sometimes go through periods when I run much less, so the point of tracking this is to keep myself accountable and encourage myself to run more consistently.
              </p>
            </>
          }
          right={
            <>
              {errorMessage ? <EmptyState>{errorMessage}</EmptyState> : null}
              {!errorMessage && entries.length === 0 ? <EmptyState>No running entries published yet.</EmptyState> : null}

              <ol className="grid gap-4">
                {entries.map((entry, index) => (
                  <li key={entry.id}>
                    <FitnessCard entry={entry} index={index} />
                  </li>
                ))}
              </ol>
            </>
          }
        />
      </div>
    </main>
  );
}

function FitnessCard({ entry, index }: { entry: FitnessEntry; index: number }) {
  return (
    <Link
      className="group grid gap-4 border border-white/10 bg-white/[0.055] p-4 backdrop-blur transition hover:border-white/20 hover:bg-white/[0.08] sm:grid-cols-[13rem_1fr] sm:p-5"
      href={`/hobbies/running/${entry.id}`}
    >
      <EntryImage entry={entry} />
      <article className="min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {entry.category ? (
              <span className="border border-lime-100/20 bg-lime-100/10 px-2 py-1 font-mono text-xs uppercase tracking-[0.12em] text-lime-100/76">
                {entry.category}
              </span>
            ) : null}
            <p className="font-mono text-xs uppercase tracking-[0.1em] text-white/34">{formatDate(entry.date)}</p>
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.08em] text-white/34">
            {String(index + 1).padStart(2, "0")}
          </p>
        </div>

        <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">{entry.title}</h2>
        {entry.description ? <p className="mt-4 line-clamp-3 text-base leading-7 text-white/64">{entry.description}</p> : null}
        <p className="mt-5 font-mono text-xs uppercase tracking-[0.12em] text-lime-100/58 transition group-hover:text-lime-100">
          Open entry
        </p>
      </article>
    </Link>
  );
}

function EntryImage({ entry }: { entry: FitnessEntry }) {
  if (!entry.imageUrl) {
    return <div className="grid min-h-44 place-items-center border border-white/10 bg-black/24 font-mono text-xs uppercase tracking-[0.12em] text-white/34">No image</div>;
  }

  return <div aria-label={entry.title} className="min-h-44 border border-white/10 bg-black/24 bg-cover bg-center" role="img" style={{ backgroundImage: `url(${entry.imageUrl})` }} />;
}

function EmptyState({ children }: { children: string }) {
  return <p className="border border-white/10 bg-white/[0.055] p-5 text-sm text-white/62 backdrop-blur">{children}</p>;
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
