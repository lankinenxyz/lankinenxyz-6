import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import NoteChapters, { type NoteChapter } from "@/components/NoteChapters";
import NoteContent from "@/components/NoteContent";
import { getHeadingId } from "@/components/NoteContent";
import SplitPage from "@/components/SplitPage";
import { getNote, type Note, type NoteBlock } from "@/lib/notion-notes";

type NoteDetailProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Notes",
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

  const chapters = getChapters(note.content);

  return (
    <main className="relative h-dvh overflow-hidden bg-[#050706] px-3 py-3 text-white sm:px-4 sm:py-4">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(135,171,105,0.2),transparent_22rem),radial-gradient(circle_at_86%_22%,rgba(91,118,137,0.22),transparent_25rem),linear-gradient(115deg,#050706_0%,#08100c_44%,#151f11_78%,#050706_100%)]" />
      <div className="fixed inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.86),rgba(0,0,0,0.34)_48%,rgba(0,0,0,0.76)),radial-gradient(circle_at_48%_118%,rgba(96,88,53,0.28),transparent_22rem)]" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col">
        <Header />

        <SplitPage
          left={
            <>
              <Link className="font-mono text-xs uppercase tracking-[0.12em] text-white/42 transition hover:text-lime-100/72" href="/notes">
                Notes
              </Link>
              <p className="mt-6 font-mono text-xs uppercase tracking-[0.12em] text-lime-100/62">{formatDate(note.date)}</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl">{note.name}</h1>
              {note.description ? <p className="mt-5 max-w-sm text-base leading-7 text-white/62">{note.description}</p> : null}
              <NoteChapters chapters={chapters} scrollContainerId="note-content-scroll" />
            </>
          }
          right={
            <article className="border border-white/10 bg-white/[0.055] p-4 backdrop-blur sm:p-6">
              <NoteContent blocks={note.content} />
            </article>
          }
          rightId="note-content-scroll"
        />
      </div>
    </main>
  );
}

function getChapters(blocks: NoteBlock[]): NoteChapter[] {
  return blocks.flatMap((block) => {
    const nestedChapters = getChapters(block.children);

    if (!isHeading(block)) {
      return nestedChapters;
    }

    const title = block.richText.map((item) => item.text).join("").trim();

    if (!title) {
      return nestedChapters;
    }

    return [
      {
        id: getHeadingId(block.id),
        title,
        level: Number(block.type.replace("heading_", "")),
      },
      ...nestedChapters,
    ];
  });
}

function isHeading(block: NoteBlock) {
  return block.type === "heading_1" || block.type === "heading_2" || block.type === "heading_3";
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
