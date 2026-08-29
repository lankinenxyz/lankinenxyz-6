import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";

const destinations = [
  { label: "About", href: "/about", shortcut: "g 1" },
  { label: "Notes", href: "/notes", shortcut: "g 2" },
  { label: "Projects", href: "/projects", shortcut: "g 3" },
  { label: "Hobbies", href: "/hobbies", shortcut: "g 4" },
];

export default function Home() {
  return (
    <main className="relative h-dvh overflow-hidden bg-[#050706] px-3 py-3 text-white sm:px-4 sm:py-4">
      <Image
        src="/hero.webp"
        alt="The Consummation of Empire by Thomas Cole"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.86),rgba(0,0,0,0.42)_45%,rgba(0,0,0,0.72))]" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black via-black/70 to-transparent" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col">
        <Header />
        <section id="home" className="grid flex-1 place-items-center py-8">
          <div className="w-full max-w-4xl">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime-100/68">
              Elias Lankinen
            </p>

            <h1 className="mt-6 text-4xl font-semibold leading-[1.06] tracking-[-0.035em] sm:text-5xl lg:text-6xl">
              I build products end to end, from{" "}
              <span className="text-lime-200">AI automation</span> down to the
              smallest visual detail.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-white/62 sm:text-lg sm:leading-8">
              Founding engineer at Elva. Previously at Silicon Valley startups
              backed by Sequoia, Khosla, and Y Combinator.
            </p>

            <nav className="mt-10 grid gap-x-8 font-mono text-sm uppercase tracking-[0.08em] sm:grid-cols-2">
              {destinations.map((destination, index) => (
                <Link
                  key={destination.href}
                  href={destination.href}
                  className="group flex items-center justify-between border-t border-white/10 py-4 text-white/80 transition hover:text-white"
                >
                  <span className="flex items-baseline gap-3">
                    <span className="text-white/32 transition group-hover:text-lime-200/70">
                      {(index + 1).toString().padStart(2, "0")}
                    </span>
                    <span className="text-base tracking-[-0.01em] sm:text-lg">
                      {destination.label}
                    </span>
                  </span>
                  <span className="relative grid min-w-12 justify-items-end text-xs text-white/38">
                    <span className="transition-opacity duration-300 group-hover:opacity-0">
                      →
                    </span>
                    <span className="absolute right-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      {destination.shortcut}
                    </span>
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        </section>
      </div>
    </main>
  );
}
