import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import SplitPage from "@/components/SplitPage";
import { getNotes, type NoteSummary } from "@/lib/notion-notes";

export const metadata: Metadata = {
  title: "Notes",
  description: "Notes by Elias Lankinen.",
};

export default async function Notes() {
  let notes: NoteSummary[] = [];
  let errorMessage = "";

  try {
    notes = await getNotes();
  } catch (error) {
    console.error("Failed to load Notion notes", error);
    errorMessage = "Notes are temporarily unavailable.";
  }

  return (
    <main className="relative h-dvh overflow-hidden bg-[#050706] px-3 py-3 text-white sm:px-4 sm:py-4">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(135,171,105,0.2),transparent_22rem),radial-gradient(circle_at_86%_22%,rgba(91,118,137,0.22),transparent_25rem),linear-gradient(115deg,#050706_0%,#08100c_44%,#151f11_78%,#050706_100%)]" />
      <div className="fixed inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.86),rgba(0,0,0,0.34)_48%,rgba(0,0,0,0.76)),radial-gradient(circle_at_48%_118%,rgba(96,88,53,0.28),transparent_22rem)]" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col">
        <Header />

        <SplitPage
          left={
            <>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime-100/68">Notes</p>
              <p className="mt-6 max-w-sm text-base leading-7 text-white/62 sm:text-lg sm:leading-8">
                My raw thoughts and observations mainly about startups and tech.
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

              {!errorMessage && notes.length === 0 ? (
                <p className="border border-white/10 bg-white/[0.055] p-5 text-sm text-white/62 backdrop-blur">
                  No published notes yet.
                </p>
              ) : null}

              <ol className="grid gap-5">
                {notes.map((note, index) => (
                  <li key={note.id}>
                    <Link
                      className="group block border border-white/10 bg-white/[0.055] p-4 backdrop-blur transition hover:border-white/20 hover:bg-white/[0.08] sm:p-6"
                      href={`/notes/${note.id}`}
                    >
                      <article>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-mono text-xs uppercase tracking-[0.12em] text-white/38">
                              {formatDate(note.date)}
                            </p>
                            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
                              {note.name}
                            </h2>
                          </div>
                          <p className="font-mono text-xs uppercase tracking-[0.08em] text-white/34">
                            {String(index + 1).padStart(2, "0")}
                          </p>
                        </div>

                        {note.description ? (
                          <p className="mt-5 line-clamp-3 max-w-2xl text-base leading-7 text-white/64">
                            {note.description}
                          </p>
                        ) : null}

                        <p className="mt-6 font-mono text-xs uppercase tracking-[0.12em] text-lime-100/58 transition group-hover:text-lime-100">
                          Read post
                        </p>
                      </article>
                    </Link>
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
