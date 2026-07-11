import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import SplitPage from "@/components/SplitPage";
import { getBooks, type Book } from "@/lib/notion-other";

type BookGroup = {
  year: string;
  books: Book[];
};

export const metadata: Metadata = {
  title: "Books | lankinen.xyz",
  description: "Books read by Elias Lankinen.",
};

export default async function Books() {
  let books: Book[] = [];
  let errorMessage = "";

  try {
    books = await getBooks();
  } catch (error) {
    console.error("Failed to load Notion books data", error);
    errorMessage = "Books are temporarily unavailable.";
  }

  const groups = groupBooksByYear(books);

  return (
    <main className="relative h-dvh overflow-hidden bg-[#050706] px-3 py-3 text-white sm:px-4 sm:py-4">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_15%_16%,rgba(135,171,105,0.2),transparent_22rem),radial-gradient(circle_at_84%_14%,rgba(91,118,137,0.22),transparent_25rem),linear-gradient(115deg,#050706_0%,#08100c_44%,#151f11_80%,#050706_100%)]" />
      <div className="fixed inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.86),rgba(0,0,0,0.34)_48%,rgba(0,0,0,0.76)),radial-gradient(circle_at_48%_118%,rgba(96,88,53,0.3),transparent_22rem)]" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col">
        <Header />

        <SplitPage
          left={
            <>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime-100/68">Hobbies / Books</p>
              <p className="mt-6 max-w-sm text-base leading-7 text-white/62 sm:text-lg sm:leading-8">
                Books I have read. It&apos;s missing many.
              </p>
            </>
          }
          right={
            <>
              {errorMessage ? <EmptyState>{errorMessage}</EmptyState> : null}
              {!errorMessage && books.length === 0 ? <EmptyState>No books published yet.</EmptyState> : null}

              <div className="grid gap-10">
                {groups.map((group) => (
                  <section aria-labelledby={`books-${group.year}`} key={group.year}>
                    <div className="mb-4 flex items-center gap-4 border-b border-white/10 pb-3">
                      <h2 id={`books-${group.year}`} className="font-mono text-xs uppercase tracking-[0.16em] text-lime-100/58">
                        {group.year}
                      </h2>
                      <p className="font-mono text-xs uppercase tracking-[0.08em] text-white/34">
                        {group.books.length.toString().padStart(2, "0")}
                      </p>
                    </div>

                    <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {group.books.map((book) => (
                        <li key={book.id}>
                          <BookCard book={book} />
                        </li>
                      ))}
                    </ol>
                  </section>
                ))}
              </div>
            </>
          }
        />
      </div>
    </main>
  );
}

function BookCard({ book }: { book: Book }) {
  const hasImage = Boolean(book.imageUrl);
  const className = "group relative block min-h-96 overflow-hidden border border-white/10 bg-white/[0.055] backdrop-blur transition hover:border-white/24";
  const content = (
    <>
      <BookImage imageUrl={book.imageUrl} label={book.title} />
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/92 via-black/42 to-black/18 transition duration-300 ${
          hasImage ? "opacity-0 group-hover:opacity-100" : "opacity-100"
        }`}
      />
      <div
        className={`absolute inset-x-0 bottom-0 p-4 transition duration-300 ${
          hasImage ? "translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100" : "translate-y-0 opacity-100"
        }`}
      >
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {book.rating ? (
            <span className="border border-lime-100/20 bg-lime-100/10 px-2 py-1 font-mono text-xs uppercase tracking-[0.12em] text-lime-100/76">
              {book.rating}
            </span>
          ) : null}
          {book.tags.slice(0, 2).map((tag) => (
            <span className="border border-white/12 bg-black/24 px-2 py-1 font-mono text-xs uppercase tracking-[0.12em] text-white/58" key={tag}>
              {tag}
            </span>
          ))}
        </div>
        <h3 className="text-2xl font-semibold tracking-[-0.04em] text-white">{book.title}</h3>
        {book.author ? <p className="mt-1 text-sm text-white/68">{book.author}</p> : null}
        {book.description ? <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/62">{book.description}</p> : null}
      </div>
    </>
  );

  if (!book.description) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link className={className} href={`/hobbies/books/${book.id}`}>
      {content}
    </Link>
  );
}

function BookImage({ imageUrl, label }: { imageUrl: string | null; label: string }) {
  if (!imageUrl) {
    return <div className="grid min-h-96 place-items-center bg-black/24 font-mono text-xs uppercase tracking-[0.12em] text-white/34">No image</div>;
  }

  return <div aria-label={label} className="min-h-96 bg-cover bg-center transition duration-500 group-hover:scale-105" role="img" style={{ backgroundImage: `url(${imageUrl})` }} />;
}

function EmptyState({ children }: { children: string }) {
  return <p className="border border-white/10 bg-white/[0.055] p-5 text-sm text-white/62 backdrop-blur">{children}</p>;
}

function groupBooksByYear(books: Book[]): BookGroup[] {
  const groups = new Map<string, Book[]>();

  books.forEach((book) => {
    const year = getDisplayYear(book.year);
    groups.set(year, [...(groups.get(year) ?? []), book]);
  });

  return Array.from(groups.entries()).map(([year, groupedBooks]) => ({ year, books: groupedBooks }));
}

function getDisplayYear(value: string | null) {
  if (!value) {
    return "Year unknown";
  }

  const match = value.match(/\d{4}/);

  return match?.[0] ?? "Year unknown";
}
