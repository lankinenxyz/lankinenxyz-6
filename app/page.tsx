import VisitorGlobe from "@/components/VisitorGlobe";

const primaryLinks = [
  { label: "Work", index: "01" },
  { label: "Notes", index: "02" },
  { label: "Globe", index: "03" },
];

const secondaryLinks = ["Projects", "Writing", "Contact"];

export default function Home() {
  return (
    <main className="relative h-dvh overflow-hidden bg-[#050706] px-3 py-3 text-white sm:px-4 sm:py-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_46%,rgba(135,171,105,0.24),transparent_22rem),radial-gradient(circle_at_36%_34%,rgba(91,118,137,0.26),transparent_24rem),linear-gradient(115deg,#050706_0%,#08100c_38%,#162111_72%,#050706_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.86),rgba(0,0,0,0.32)_45%,rgba(0,0,0,0.72)),radial-gradient(circle_at_50%_120%,rgba(96,88,53,0.34),transparent_22rem)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black via-black/70 to-transparent" />

      <div className="relative z-10 flex h-full flex-col">
        <nav className="flex items-start justify-between gap-3 font-mono text-xs uppercase tracking-[0.08em] text-zinc-100 sm:text-sm">
          <a href="#home" className="flex shrink-0 items-center gap-3 pr-2 text-lg font-semibold tracking-tight sm:text-xl">
            <span className="grid size-8 place-items-center rounded-full border border-white/30 bg-white/10 text-sm">L</span>
            <span className="hidden sm:inline">Lankinen</span>
          </a>

          <div className="hidden min-w-0 flex-1 gap-1 md:flex">
            {primaryLinks.map((link) => (
              <a
                href={`#${link.label.toLowerCase()}`}
                key={link.label}
                className="flex h-10 flex-1 items-center justify-between border border-white/10 bg-white/[0.09] px-4 text-white/86 backdrop-blur transition hover:bg-white/[0.16]"
              >
                <span>{link.label}</span>
                <span className="text-white/38">{link.index}</span>
              </a>
            ))}
          </div>

          <div className="flex shrink-0 flex-wrap justify-end gap-1">
            {secondaryLinks.map((link) => (
              <a
                href={`#${link.toLowerCase()}`}
                key={link}
                className="hidden h-10 items-center border border-white/10 bg-black/30 px-3 text-white/80 backdrop-blur transition hover:bg-white/10 lg:flex"
              >
                {link}
              </a>
            ))}
            <a href="mailto:hello@lankinen.xyz" className="flex h-10 items-center border border-white/20 bg-black/30 px-3 text-white backdrop-blur transition hover:bg-white/10">
              Email
            </a>
            <a href="#globe" className="flex h-10 items-center bg-white px-3 font-semibold text-black transition hover:bg-lime-100 sm:px-4">
              Visitor Globe
              <span className="ml-2">›</span>
            </a>
          </div>
        </nav>

        <section id="home" className="grid min-h-0 flex-1 items-end gap-6 pb-5 pt-8 lg:grid-cols-[minmax(0,0.88fr)_minmax(22rem,0.72fr)] lg:items-center lg:pb-10 lg:pt-6">
          <div className="max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.32em] text-lime-200/80 sm:text-sm">
              Personal website
            </p>
            <h1 className="mt-4 max-w-4xl text-[clamp(3rem,8vw,7.6rem)] font-medium leading-[0.92] tracking-[-0.07em] text-white">
              A quiet signal from everywhere this site travels.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/55 sm:text-lg">
              I build, write, and collect small signals from the web. The globe marks recent visiting countries from Google Analytics without exposing exact counts.
            </p>
            <div className="mt-8 flex flex-wrap gap-2 font-mono text-xs uppercase tracking-[0.08em] sm:text-sm">
              <a href="#work" className="bg-white px-4 py-3 font-semibold text-black transition hover:bg-lime-100">
                View work <span className="ml-2">›</span>
              </a>
              <a href="#contact" className="border border-white/10 bg-white/[0.08] px-4 py-3 text-white/80 backdrop-blur transition hover:bg-white/[0.14]">
                Get in touch <span className="ml-2 text-white/45">›</span>
              </a>
            </div>
          </div>

          <div id="globe" className="min-h-0">
            <VisitorGlobe />
          </div>
        </section>
      </div>
    </main>
  );
}
