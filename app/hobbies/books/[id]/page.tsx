import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import OtherContent from "@/components/OtherContent";
import SplitPage from "@/components/SplitPage";
import { getBook, type Book } from "@/lib/notion-other";

type BookDetailProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Books",
  description: "Book notes by Elias Lankinen.",
};

export default async function BookDetail({ params }: BookDetailProps) {
  const { id } = await params;
  let book: Book | null = null;

  try {
    book = await getBook(id);
  } catch (error) {
    console.error("Failed to load Notion book", error);
  }

  if (!book) {
    notFound();
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
              <Link className="font-mono text-xs uppercase tracking-[0.12em] text-white/42 transition hover:text-lime-100/72" href="/hobbies/books">
                Hobbies / Books
              </Link>
              <p className="mt-6 font-mono text-xs uppercase tracking-[0.12em] text-lime-100/62">{getDisplayYear(book.year)}</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl">{book.title}</h1>
              {book.author ? <p className="mt-3 text-lg text-white/62">{book.author}</p> : null}
              <div className="mt-5 flex flex-wrap gap-2">
                {book.rating ? (
                  <span className="border border-lime-100/20 bg-lime-100/10 px-2 py-1 font-mono text-xs uppercase tracking-[0.12em] text-lime-100/76">
                    {book.rating}
                  </span>
                ) : null}
                {book.tags.map((tag) => (
                  <span className="border border-white/12 bg-black/24 px-2 py-1 font-mono text-xs uppercase tracking-[0.12em] text-white/58" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </>
          }
          right={
            <article className="border border-white/10 bg-white/[0.055] p-4 backdrop-blur sm:p-6">
              {book.imageUrl ? (
                <div aria-label={book.title} className="mb-6 min-h-96 border border-white/10 bg-black/24 bg-contain bg-center bg-no-repeat" role="img" style={{ backgroundImage: `url(${book.imageUrl})` }} />
              ) : null}
              {book.description ? <p className="mb-6 text-base leading-7 text-white/70 sm:text-lg sm:leading-8">{book.description}</p> : null}
              <OtherContent blocks={book.content ?? []} />
            </article>
          }
        />
      </div>
    </main>
  );
}

function getDisplayYear(value: string | null) {
  if (!value) {
    return "Year unknown";
  }

  const match = value.match(/\d{4}/);

  return match?.[0] ?? "Year unknown";
}
