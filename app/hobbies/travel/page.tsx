import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import SplitPage from "@/components/SplitPage";
import { getTravelDestinations, type TravelDestination } from "@/lib/notion-other";

export const metadata: Metadata = {
  title: "Travel | lankinen.xyz",
  description: "Travel destinations by Elias Lankinen.",
};

export default async function Travel() {
  let destinations: TravelDestination[] = [];
  let errorMessage = "";

  try {
    destinations = await getTravelDestinations();
  } catch (error) {
    console.error("Failed to load Notion travel data", error);
    errorMessage = "Travel destinations are temporarily unavailable.";
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
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime-100/68">Hobbies / Travel</p>
              <p className="mt-6 max-w-sm text-base leading-7 text-white/62 sm:text-lg sm:leading-8">
                I like to see new places.
              </p>
            </>
          }
          right={
            <>
              {errorMessage ? <EmptyState>{errorMessage}</EmptyState> : null}
              {!errorMessage && destinations.length === 0 ? <EmptyState>No travel destinations published yet.</EmptyState> : null}

              <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {destinations.map((destination) => (
                  <li key={destination.id}>
                    <TravelCard destination={destination} />
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

function TravelCard({ destination }: { destination: TravelDestination }) {
  return (
    <Link
      className="group relative block min-h-72 overflow-hidden border border-white/10 bg-white/[0.055] backdrop-blur transition hover:border-white/24"
      href={`/other/travel/${destination.id}`}
    >
      <GridImage imageUrl={destination.imageUrl} label={destination.title} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/86 via-black/18 to-black/18 opacity-0 transition duration-300 group-hover:opacity-100" />
      <div className="absolute inset-x-0 bottom-0 translate-y-3 p-4 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-lime-100/68">{formatTravelDate(destination)}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">{destination.city}</h2>
        {destination.country ? <p className="mt-1 text-sm text-white/66">{destination.country}</p> : null}
      </div>
    </Link>
  );
}

function GridImage({ imageUrl, label }: { imageUrl: string | null; label: string }) {
  if (!imageUrl) {
    return <div className="grid min-h-72 place-items-center bg-black/24 font-mono text-xs uppercase tracking-[0.12em] text-white/34">No image</div>;
  }

  return <div aria-label={label} className="min-h-72 bg-cover bg-center transition duration-500 group-hover:scale-105" role="img" style={{ backgroundImage: `url(${imageUrl})` }} />;
}

function EmptyState({ children }: { children: string }) {
  return <p className="border border-white/10 bg-white/[0.055] p-5 text-sm text-white/62 backdrop-blur">{children}</p>;
}

function formatTravelDate(destination: TravelDestination) {
  return [destination.month, destination.year].filter(Boolean).join(" ") || "Date unknown";
}
