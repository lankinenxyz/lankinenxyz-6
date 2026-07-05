import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import OtherContent from "@/components/OtherContent";
import { getWatch, type Watch } from "@/lib/notion-other";

type WatchDetailProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Watches | lankinen.xyz",
  description: "Watch details by Elias Lankinen.",
};

export default async function WatchDetail({ params }: WatchDetailProps) {
  const { id } = await params;
  let watch: Watch | null = null;

  try {
    watch = await getWatch(id);
  } catch (error) {
    console.error("Failed to load Notion watch", error);
  }

  if (!watch) {
    notFound();
  }

  return (
    <main className="relative h-dvh overflow-hidden bg-[#050706] px-3 py-3 text-white sm:px-4 sm:py-4">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_15%_16%,rgba(135,171,105,0.2),transparent_22rem),radial-gradient(circle_at_84%_14%,rgba(91,118,137,0.22),transparent_25rem),linear-gradient(115deg,#050706_0%,#08100c_44%,#151f11_80%,#050706_100%)]" />
      <div className="fixed inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.86),rgba(0,0,0,0.34)_48%,rgba(0,0,0,0.76)),radial-gradient(circle_at_48%_118%,rgba(96,88,53,0.3),transparent_22rem)]" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col">
        <Header />

        <section className="grid min-h-0 flex-1 gap-8 overflow-y-auto py-8 sm:py-12 lg:grid-cols-[0.62fr_1.38fr] lg:gap-12 lg:py-16">
          <div className="lg:sticky lg:h-fit">
            <Link className="font-mono text-xs uppercase tracking-[0.12em] text-white/42 transition hover:text-lime-100/72" href="/other/watches">
              Other / Watches
            </Link>
            <p className="mt-6 font-mono text-xs uppercase tracking-[0.12em] text-lime-100/62">{watch.year || "Year unknown"}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl">{watch.title}</h1>
          </div>

          <article className="min-w-0 border border-white/10 bg-white/[0.055] p-4 backdrop-blur sm:p-6">
            {watch.imageUrl ? (
              <div aria-label={watch.title} className="mb-6 min-h-80 border border-white/10 bg-black/24 bg-cover bg-center" role="img" style={{ backgroundImage: `url(${watch.imageUrl})` }} />
            ) : null}
            <OtherContent blocks={watch.content ?? []} />
          </article>
        </section>
      </div>
    </main>
  );
}
