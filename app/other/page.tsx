import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";

const sections = [
  {
    title: "Investing",
    href: "/other/investing",
    description: "Markets, allocation, risk, and long-term compounding notes.",
  },
  {
    title: "Fitness",
    href: "/other/fitness",
    description: "Training logs, routines, recovery, and experiments.",
  },
  {
    title: "Watches",
    href: "/other/watches",
    description: "References, collecting notes, design, and mechanics.",
  },
  {
    title: "Travel",
    href: "/other/travel",
    description: "Places, routes, stays, and practical observations.",
  },
];

export const metadata: Metadata = {
  title: "Other | lankinen.xyz",
  description: "Other interests by Elias Lankinen.",
};

export default function Other() {
  return (
    <main className="relative h-dvh overflow-hidden bg-[#050706] px-3 py-3 text-white sm:px-4 sm:py-4">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_16%_16%,rgba(135,171,105,0.2),transparent_22rem),radial-gradient(circle_at_84%_14%,rgba(91,118,137,0.22),transparent_25rem),linear-gradient(115deg,#050706_0%,#08100c_44%,#151f11_80%,#050706_100%)]" />
      <div className="fixed inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.86),rgba(0,0,0,0.34)_48%,rgba(0,0,0,0.76)),radial-gradient(circle_at_48%_118%,rgba(96,88,53,0.3),transparent_22rem)]" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col">
        <Header />

        <section className="grid min-h-0 flex-1 gap-8 overflow-y-auto py-8 sm:py-12 lg:grid-cols-[0.62fr_1.38fr] lg:gap-12 lg:py-16">
          <div className="lg:sticky lg:h-fit">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime-100/68">Other</p>
            <p className="mt-6 max-w-sm text-base leading-7 text-white/62 sm:text-lg sm:leading-8">
              Side interests and personal systems. The sections are ready to grow into their own pages.
            </p>
          </div>

          <ol className="grid min-w-0 gap-4 sm:grid-cols-2">
            {sections.map((section, index) => (
              <li key={section.href}>
                <Link
                  className="group flex h-full min-h-56 flex-col justify-between border border-white/10 bg-white/[0.055] p-5 backdrop-blur transition hover:border-white/20 hover:bg-white/[0.08] sm:p-6"
                  href={section.href}
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <p className="font-mono text-xs uppercase tracking-[0.08em] text-white/34">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                      <span className="border border-white/12 bg-black/20 px-2 py-1 font-mono text-xs uppercase tracking-[0.08em] text-white/42 transition group-hover:border-lime-100/28 group-hover:text-lime-100/72">
                        Soon
                      </span>
                    </div>
                    <h2 className="mt-8 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
                      {section.title}
                    </h2>
                    <p className="mt-4 text-base leading-7 text-white/62">{section.description}</p>
                  </div>

                  <p className="mt-8 font-mono text-xs uppercase tracking-[0.12em] text-lime-100/58 transition group-hover:text-lime-100">
                    Open section
                  </p>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}
