import Header from "@/components/Header";
import SplitPage from "@/components/SplitPage";

const education = [
  "M.Sc. in Data Science, University of Helsinki",
  "B.Sc. in Computer Science, University of Helsinki",
];

type Experience = {
  role: string;
  company: string;
  period: string;
  location: string | null;
  description: string | null;
  link?: string;
  logoUrl?: string;
};

const experience: Experience[] = [
  {
    role: "Founding Engineer",
    company: "Elva",
    period: "Jan 2026 - Present · 7 mos",
    location: "Helsinki, Finland",
    description: null,
    logoUrl: "/elva.jpg",
    link: "https://withelva.com"
  },
  {
    role: "Software Engineer",
    company: "NestAI",
    period: "Mar 2025 - Jan 2026 · 11 mos",
    location: "Helsinki, Finland",
    description: "2nd employee",
    logoUrl: "/nestai.jpg",
    link: "https://nestai.com"
  },
  {
    role: "Software Engineer",
    company: "FUNNZ",
    period: "Jul 2024 - Dec 2024 · 6 mos",
    location: "Gzira, Malta",
    description: "Side quest to learn more about the online gambling industry.",
    logoUrl: "/funnz.jpg",
    link: "https://funnz.io"
  },
  {
    role: "Software Engineer",
    company: "Compound",
    period: "Aug 2021 - Jul 2024 · 3 yrs",
    location: "San Francisco, California, United States",
    description:
      "YC-backed Independent RIA and digital family office providing financial planning, investment management, and tax services to entrepreneurs and tech executives. Raised $37mm from Greenoaks, Lachy Groom, Y Combinator.",
    logoUrl: "/compound.jpg",
    link: "https://compoundplanning.com"
  },
  {
    role: "Consultant",
    company: "WithCoverage",
    period: "Aug 2023 - Oct 2023 · 3 mos",
    location: "New York, New York, United States",
    description:
      "Khosla Ventures and Sequoia-backed startup transforming the insurance brokerage industry. I contributed early on by setting up the core technologies and developing the first functional web dashboard.",
    logoUrl: "withcoverage.jpg",
    link: "https://www.withcoverage.com"
  },
  {
    role: "Software Engineer",
    company: "Neverthink",
    period: "Jan 2021 - Aug 2021 · 8 mos",
    location: "Helsinki, Finland",
    description: "Acquired by Reddit",
    logoUrl: "neverthink.jpg"
  },
  {
    role: "Teaching Assistant",
    company: "University of Helsinki",
    period: "Jun 2020 - Jul 2020 · 2 mos",
    location: "Helsinki, Finland",
    description: "Software Production Course",
    logoUrl: "/uh.jpg"
  },
  {
    role: "Software Engineer",
    company: "Stealth Startup",
    period: "Jan 2020 - Jul 2020 · 7 mos",
    location: null,
    description: "EdTech startup",
    logoUrl: "/stealth.jpg"
  },
];

const volunteering = [
  { role: "Judge & Mentor", organization: "Stuhi hackathon", period: "Jan 2026" },
  { role: "Volunteer", organization: "Slush", period: "Dec 2019" },
  { role: "Volunteer", organization: "Slush", period: "Dec 2018" },
  { role: "Volunteer", organization: "Slush", period: "Dec 2017" },
];

export default function About() {
  return (
    <main className="relative h-dvh overflow-hidden bg-[#050706] px-3 py-3 text-white sm:px-4 sm:py-4">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(135,171,105,0.22),transparent_23rem),radial-gradient(circle_at_86%_8%,rgba(91,118,137,0.24),transparent_26rem),linear-gradient(115deg,#050706_0%,#08100c_42%,#151f11_78%,#050706_100%)]" />
      <div className="fixed inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.84),rgba(0,0,0,0.38)_48%,rgba(0,0,0,0.74)),radial-gradient(circle_at_48%_118%,rgba(96,88,53,0.28),transparent_22rem)]" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col">
        <Header />

        <SplitPage
          left={
            <>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime-100/68">About</p>
              <div className="mt-7 grid gap-4 text-base leading-7 text-white/68 sm:text-lg sm:leading-8">
                <p>
                  I’m a product-oriented generalist software engineer. I’m currently the founding engineer at Elva, where I work across the full product, from AI automation to the smallest visual details.
                </p>
                <p>
                  I’ve worked at top Silicon Valley startups backed by Sequoia, Khosla, and YC, alongside unicorn founders.
                </p>
              </div>

              <section className="mt-10 border border-white/10 bg-white/[0.06] p-4 backdrop-blur sm:p-5">
                <h2 className="font-mono text-xs uppercase tracking-[0.16em] text-white/48">Formal Education</h2>
                <ul className="mt-4 grid gap-3 text-sm text-white/78 sm:text-base">
                  {education.map((degree) => (
                    <li key={degree} className="border-l border-lime-100/38 pl-3">
                      {degree}
                    </li>
                  ))}
                </ul>
              </section>
            </>
          }
          right={
            <>
              <section aria-labelledby="experience-heading">
                <div className="mb-5 flex items-end justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <h2
                      id="experience-heading"
                      className="mt-2 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl"
                    >
                      Experience
                    </h2>
                  </div>
                </div>

                <ol className="grid gap-3">
                  {experience.map((item, index) => (
                    <li key={`${item.company}-${item.period}`}>
                      <ExperienceCard index={index} item={item} />
                    </li>
                  ))}
                </ol>
              </section>

              <section aria-labelledby="volunteering-heading">
                <div className="mb-5 flex items-end justify-between gap-4 border-b border-white/10 pb-4">
                  <h2
                    id="volunteering-heading"
                    className="mt-2 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl"
                  >
                    Volunteering
                  </h2>
                </div>

                <ol className="grid gap-3 sm:grid-cols-3">
                  {volunteering.map((item) => (
                    <li
                      key={item.period}
                      className="border border-white/10 bg-white/[0.055] p-4 backdrop-blur transition hover:border-white/20 hover:bg-white/[0.08] sm:p-5"
                    >
                      <p className="font-mono text-xs uppercase tracking-[0.12em] text-white/38">{item.period}</p>
                      <h3 className="mt-4 text-lg font-semibold tracking-[-0.02em] text-white">{item.role}</h3>
                      <p className="mt-1 text-sm text-white/70 sm:text-base">{item.organization}</p>
                    </li>
                  ))}
                </ol>
              </section>
            </>
          }
          rightClassName="space-y-10 lg:pr-2"
        />
      </div>
    </main>
  );
}

function ExperienceCard({ index, item }: { index: number; item: Experience }) {
  const className =
    "group block border border-white/10 bg-white/[0.055] p-4 backdrop-blur transition hover:border-white/20 hover:bg-white/[0.08] sm:p-5";
  const content = (
    <div className="flex gap-4">
      <div className="grid size-11 shrink-0 place-items-center overflow-hidden border border-white/12 bg-black/24 font-mono text-xs font-semibold uppercase text-lime-100/76 sm:size-12">
        {item.logoUrl ? (
          <img src={item.logoUrl} alt={`${item.company} logo`} className="size-full rounded object-cover" />
        ) : (
          item.company
            .split(" ")
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div>
            <h3 className="text-lg font-semibold leading-none tracking-[-0.02em] text-white sm:text-xl">{item.role}</h3>
            <p className="mt-1.5 text-sm text-white/70 sm:text-base">{item.company}</p>
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.08em] text-white/42 sm:max-w-44 sm:text-right">
            {String(index + 1).padStart(2, "0")}
          </p>
        </div>

        <div className="mt-3 flex flex-col gap-x-3 gap-y-1 font-mono text-xs uppercase tracking-[0.08em] text-white/38">
          <span>{item.period}</span>
          {item.location ? <span>{item.location}</span> : null}
        </div>

        {item.description ? <p className="mt-4 text-sm leading-6 text-white/62">{item.description}</p> : null}
      </div>
    </div>
  );

  if (!item.link) {
    return <div className={className}>{content}</div>;
  }

  return (
    <a aria-label={`Open ${item.company}`} className={className} href={item.link} rel="noreferrer" target="_blank">
      {content}
    </a>
  );
}
