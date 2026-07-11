import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import ProjectContent from "@/components/ProjectContent";
import SplitPage from "@/components/SplitPage";
import { getProject, type Project } from "@/lib/notion-projects";

type ProjectDetailProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Projects | lankinen.xyz",
  description: "Project details by Elias Lankinen.",
};

export default async function ProjectDetail({ params }: ProjectDetailProps) {
  const { id } = await params;
  let project: Project | null = null;

  try {
    project = await getProject(id);
  } catch (error) {
    console.error("Failed to load Notion project", error);
  }

  if (!project) {
    notFound();
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
              <Link className="font-mono text-xs uppercase tracking-[0.12em] text-white/42 transition hover:text-lime-100/72" href="/projects">
                Projects
              </Link>
              {project.year ? <p className="mt-6 font-mono text-xs uppercase tracking-[0.12em] text-lime-100/62">{formatYear(project.year)}</p> : null}
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl">{project.title}</h1>
              {project.intro ? <p className="mt-5 max-w-sm text-base leading-7 text-white/72">{project.intro}</p> : null}
              {project.description ? <p className="mt-5 max-w-sm text-base leading-7 text-white/62">{project.description}</p> : null}
              {project.link ? (
                <a
                  className="mt-6 inline-block font-mono text-xs uppercase tracking-[0.12em] text-lime-100/62 transition hover:text-lime-100"
                  href={project.link}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open project
                </a>
              ) : null}
            </>
          }
          right={
            <article className="border border-white/10 bg-white/[0.055] p-4 backdrop-blur sm:p-6">
              {project.imageUrls.length > 0 ? <ProjectImages imageUrls={project.imageUrls} title={project.title} /> : null}
              {project.content ? (
                <div className={project.imageUrls.length > 0 ? "mt-6" : undefined}>
                  <ProjectContent blocks={project.content} />
                </div>
              ) : null}
            </article>
          }
        />
      </div>
    </main>
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

function formatYear(value: string) {
  const match = value.match(/\d{4}/);

  return match?.[0] ?? value;
}
