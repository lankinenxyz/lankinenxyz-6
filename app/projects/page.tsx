import type { Metadata } from "next";
import Header from "@/components/Header";
import SplitPage from "@/components/SplitPage";
import { getProjects, type Project } from "@/lib/notion-projects";

export const metadata: Metadata = {
  title: "Projects | lankinen.xyz",
  description: "Projects by Elias Lankinen.",
};

export default async function Projects() {
  let projects: Project[] = [];
  let errorMessage = "";

  try {
    projects = await getProjects();
  } catch (error) {
    console.error("Failed to load Notion projects", error);
    errorMessage = "Projects are temporarily unavailable.";
  }

  return (
    <main className="relative h-dvh overflow-hidden bg-[#050706] px-3 py-3 text-white sm:px-4 sm:py-4">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(135,171,105,0.2),transparent_22rem),radial-gradient(circle_at_82%_10%,rgba(91,118,137,0.22),transparent_25rem),linear-gradient(115deg,#050706_0%,#08100c_44%,#151f11_80%,#050706_100%)]" />
      <div className="fixed inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.86),rgba(0,0,0,0.34)_48%,rgba(0,0,0,0.76)),radial-gradient(circle_at_48%_118%,rgba(96,88,53,0.3),transparent_22rem)]" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col">
        <Header />

        <SplitPage
          left={
            <>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime-100/68">Projects</p>
              <p className="mt-6 max-w-sm text-base leading-7 text-white/62 sm:text-lg sm:leading-8">
                I’m still figuring out how to present these. So coming soon…
              </p>
            </>
          }
          right={
            <>
              {errorMessage ? (
                <p className="border border-white/10 bg-white/[0.055] p-5 text-sm text-white/62 backdrop-blur">
                  {errorMessage}
                </p>
              ) : null}

              {!errorMessage && projects.length === 0 ? (
                <p className="border border-white/10 bg-white/[0.055] p-5 text-sm text-white/62 backdrop-blur">
                  No projects published yet.
                </p>
              ) : null}

              <ol className="grid gap-5">
                {projects.map((project, index) => (
                  <li
                    key={project.id}
                    className="group border border-white/10 bg-white/[0.055] p-4 backdrop-blur transition hover:border-white/20 hover:bg-white/[0.08] sm:p-6"
                  >
                    <article className="grid gap-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 gap-4">
                          <ProjectLogo project={project} />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              {project.status ? <ProjectStatus status={project.status} /> : null}
                              <p className="font-mono text-xs uppercase tracking-[0.08em] text-white/34">
                                {String(index + 1).padStart(2, "0")}
                              </p>
                            </div>
                            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
                              {project.title}
                            </h2>
                          </div>
                        </div>

                        {project.link ? (
                          <a
                            className="w-fit border border-white/12 bg-white px-3 py-2 font-mono text-xs font-semibold uppercase tracking-[0.08em] text-black transition hover:bg-lime-100"
                            href={project.link}
                            rel="noreferrer"
                            target="_blank"
                          >
                            Open
                          </a>
                        ) : null}
                      </div>

                      {project.description ? (
                        <p className="max-w-2xl text-base leading-7 text-white/68 sm:text-lg sm:leading-8">
                          {project.description}
                        </p>
                      ) : null}

                      {project.imageUrls.length > 0 ? <ProjectImages imageUrls={project.imageUrls} title={project.title} /> : null}
                    </article>
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

function ProjectLogo({ project }: { project: Project }) {
  if (project.logoUrl) {
    return (
      <div
        aria-label={`${project.title} logo`}
        className="size-14 shrink-0 border border-white/12 bg-black/24 bg-cover bg-center sm:size-16"
        role="img"
        style={{ backgroundImage: `url(${project.logoUrl})` }}
      />
    );
  }

  return (
    <div className="grid size-14 shrink-0 place-items-center border border-white/12 bg-black/24 font-mono text-sm font-semibold uppercase text-lime-100/76 sm:size-16">
      {project.title
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)}
    </div>
  );
}

function ProjectStatus({ status }: { status: string }) {
  return (
    <span className="border border-lime-100/20 bg-lime-100/10 px-2 py-1 font-mono text-xs uppercase tracking-[0.12em] text-lime-100/76">
      {status}
    </span>
  );
}

function ProjectImages({ imageUrls, title }: { imageUrls: string[]; title: string }) {
  const primaryImage = imageUrls[0];
  const secondaryImages = imageUrls.slice(1, 4);

  return (
    <div className="grid gap-2 sm:grid-cols-[1.4fr_0.9fr]">
      <div
        aria-label={`${title} image 1`}
        className="min-h-56 border border-white/10 bg-black/24 bg-cover bg-center sm:min-h-72"
        role="img"
        style={{ backgroundImage: `url(${primaryImage})` }}
      />
      {secondaryImages.length > 0 ? (
        <div className="grid gap-2 sm:grid-rows-3">
          {secondaryImages.map((imageUrl, index) => (
            <div
              aria-label={`${title} image ${index + 2}`}
              className="min-h-28 border border-white/10 bg-black/24 bg-cover bg-center"
              key={imageUrl}
              role="img"
              style={{ backgroundImage: `url(${imageUrl})` }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
