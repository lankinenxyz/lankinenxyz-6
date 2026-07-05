import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import NoteContent from "@/components/NoteContent";
import { getNote, type Note } from "@/lib/notion-notes";

type NoteDetailProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Notes | lankinen.xyz",
  description: "Note by Elias Lankinen.",
};

export default async function NoteDetail({ params }: NoteDetailProps) {
  const { id } = await params;
  let note: Note | null = null;

  try {
    note = await getNote(id);
  } catch (error) {
    console.error("Failed to load Notion note", error);
  }

  if (!note) {
    notFound();
  }

  return (
    <main className="relative h-dvh overflow-hidden bg-[#050706] px-3 py-3 text-white sm:px-4 sm:py-4">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(135,171,105,0.2),transparent_22rem),radial-gradient(circle_at_86%_22%,rgba(91,118,137,0.22),transparent_25rem),linear-gradient(115deg,#050706_0%,#08100c_44%,#151f11_78%,#050706_100%)]" />
      <div className="fixed inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.86),rgba(0,0,0,0.34)_48%,rgba(0,0,0,0.76)),radial-gradient(circle_at_48%_118%,rgba(96,88,53,0.28),transparent_22rem)]" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col">
        <Header />

        <section className="grid min-h-0 flex-1 gap-8 overflow-y-auto py-8 sm:py-12 lg:grid-cols-[0.62fr_1.38fr] lg:gap-12 lg:overflow-hidden lg:py-16">
          <div className="lg:sticky lg:h-fit">
            <Link className="font-mono text-xs uppercase tracking-[0.12em] text-white/42 transition hover:text-lime-100/72" href="/notes">
              Notes
            </Link>
            <p className="mt-6 font-mono text-xs uppercase tracking-[0.12em] text-lime-100/62">{formatDate(note.date)}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl">{note.name}</h1>
            {note.description ? <p className="mt-5 max-w-sm text-base leading-7 text-white/62">{note.description}</p> : null}
          </div>

          <article className="scrollbar-none min-w-0 border border-white/10 bg-white/[0.055] p-4 backdrop-blur sm:p-6 lg:overflow-y-auto">
            <NoteContent blocks={note.content} />
          </article>
        </section>
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
