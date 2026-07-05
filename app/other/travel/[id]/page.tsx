import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import OtherContent from "@/components/OtherContent";
import { getTravelDestination, type TravelDestination } from "@/lib/notion-other";

type TravelDetailProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Travel | lankinen.xyz",
  description: "Travel destination details by Elias Lankinen.",
};

export default async function TravelDetail({ params }: TravelDetailProps) {
  const { id } = await params;
  let destination: TravelDestination | null = null;

  try {
    destination = await getTravelDestination(id);
  } catch (error) {
    console.error("Failed to load Notion travel destination", error);
  }

  if (!destination) {
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
            <Link className="font-mono text-xs uppercase tracking-[0.12em] text-white/42 transition hover:text-lime-100/72" href="/other/travel">
              Other / Travel
            </Link>
            <p className="mt-6 font-mono text-xs uppercase tracking-[0.12em] text-lime-100/62">{formatTravelDate(destination)}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl">{destination.city}</h1>
            {destination.country ? <p className="mt-3 text-lg text-white/62">{destination.country}</p> : null}
          </div>

          <article className="min-w-0 border border-white/10 bg-white/[0.055] p-4 backdrop-blur sm:p-6">
            {destination.imageUrl ? (
              <div aria-label={destination.title} className="mb-6 min-h-80 border border-white/10 bg-black/24 bg-cover bg-center" role="img" style={{ backgroundImage: `url(${destination.imageUrl})` }} />
            ) : null}
            <OtherContent blocks={destination.content ?? []} />
          </article>
        </section>
      </div>
    </main>
  );
}

function formatTravelDate(destination: TravelDestination) {
  return [destination.month, destination.year].filter(Boolean).join(" ") || "Date unknown";
}
