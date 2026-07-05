import type { Metadata } from "next";
import Header from "@/components/Header";
import { getNotes, type Note, type NoteBlock, type NoteRichText } from "@/lib/notion-notes";

export const metadata: Metadata = {
  title: "Notes | lankinen.xyz",
  description: "Notes by Elias Lankinen.",
};

export default async function Notes() {
  let notes: Note[] = [];
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

        <section className="grid min-h-0 flex-1 gap-8 overflow-y-auto py-8 sm:py-12 lg:grid-cols-[0.62fr_1.38fr] lg:gap-12 lg:py-16">
          <div className="lg:sticky lg:h-fit">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime-100/68">Notes</p>
            <p className="mt-6 max-w-sm text-base leading-7 text-white/62 sm:text-lg sm:leading-8">
              Field notes, rough edges, saved thoughts.
            </p>
          </div>

          <div className="min-w-0">
            {errorMessage ? (
              <p className="border border-white/10 bg-white/[0.055] p-5 text-sm text-white/62 backdrop-blur">
                {errorMessage}
              </p>
            ) : null}

            {!errorMessage && notes.length === 0 ? (
              <p className="border border-white/10 bg-white/[0.055] p-5 text-sm text-white/62 backdrop-blur">
                No notes published yet.
              </p>
            ) : null}

            <ol className="grid gap-5">
              {notes.map((note, index) => (
                <li
                  key={note.id}
                  className="border border-white/10 bg-white/[0.055] p-4 backdrop-blur transition hover:border-white/20 hover:bg-white/[0.08] sm:p-6"
                >
                  <article>
                    <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
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

                    <div className="mt-5 grid gap-3 text-base leading-7 text-white/70">
                      {note.content.length > 0 ? (
                        note.content.map((block) => <BlockRenderer block={block} key={block.id} />)
                      ) : (
                        <p className="text-sm text-white/42">No content.</p>
                      )}
                    </div>
                  </article>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </main>
  );
}

function BlockRenderer({ block }: { block: NoteBlock }) {
  const children = block.children.length > 0 ? <NestedBlocks blocks={block.children} /> : null;

  switch (block.type) {
    case "heading_1":
      return <h2 className="pt-4 text-3xl font-semibold tracking-[-0.04em] text-white">{renderRichText(block.richText)}</h2>;
    case "heading_2":
      return <h3 className="pt-3 text-2xl font-semibold tracking-[-0.03em] text-white">{renderRichText(block.richText)}</h3>;
    case "heading_3":
      return <h4 className="pt-2 text-xl font-semibold tracking-[-0.02em] text-white">{renderRichText(block.richText)}</h4>;
    case "bulleted_list_item":
      return (
        <div className="grid grid-cols-[auto_1fr] gap-3">
          <span className="mt-3 size-1.5 bg-lime-100/58" />
          <div>
            <p>{renderRichText(block.richText)}</p>
            {children}
          </div>
        </div>
      );
    case "numbered_list_item":
      return (
        <div className="grid grid-cols-[auto_1fr] gap-3">
          <span className="mt-1 font-mono text-xs text-lime-100/58">#</span>
          <div>
            <p>{renderRichText(block.richText)}</p>
            {children}
          </div>
        </div>
      );
    case "to_do":
      return (
        <div className="grid grid-cols-[auto_1fr] gap-3">
          <span className="mt-1.5 size-4 border border-white/20 bg-black/20" />
          <div>
            <p>{renderRichText(block.richText)}</p>
            {children}
          </div>
        </div>
      );
    case "quote":
      return (
        <blockquote className="border-l border-lime-100/42 pl-4 text-white/78">
          {renderRichText(block.richText)}
          {children}
        </blockquote>
      );
    case "code":
      return (
        <pre className="overflow-x-auto border border-white/10 bg-black/34 p-4 font-mono text-sm leading-6 text-white/76">
          <code>{block.richText.map((item) => item.text).join("")}</code>
        </pre>
      );
    case "divider":
      return <hr className="my-3 border-white/10" />;
    case "toggle":
      return (
        <details className="border border-white/10 bg-black/18 p-3">
          <summary className="cursor-pointer text-white/82">{renderRichText(block.richText)}</summary>
          {children}
        </details>
      );
    case "paragraph":
      if (block.richText.length === 0 && !children) {
        return <div className="h-3" />;
      }

      return (
        <div>
          {block.richText.length > 0 ? <p>{renderRichText(block.richText)}</p> : null}
          {children}
        </div>
      );
    default:
      if (block.richText.length === 0 && !children) {
        return null;
      }

      return (
        <div>
          {renderRichText(block.richText)}
          {children}
        </div>
      );
  }
}

function NestedBlocks({ blocks }: { blocks: NoteBlock[] }) {
  return (
    <div className="mt-3 grid gap-2 border-l border-white/10 pl-4 text-sm leading-6 text-white/62">
      {blocks.map((block) => (
        <BlockRenderer block={block} key={block.id} />
      ))}
    </div>
  );
}

function renderRichText(richText: NoteRichText[]) {
  if (richText.length === 0) {
    return null;
  }

  return richText.map((item, index) => {
    const className = [
      item.bold ? "font-semibold text-white/90" : "",
      item.italic ? "italic" : "",
      item.strikethrough ? "line-through" : "",
      item.underline ? "underline underline-offset-4" : "",
      item.code ? "border border-white/10 bg-black/28 px-1 py-0.5 font-mono text-sm text-lime-100/82" : "",
    ]
      .filter(Boolean)
      .join(" ");

    const content = item.href ? (
      <a className="text-lime-100/82 underline underline-offset-4 transition hover:text-lime-100" href={item.href}>
        {item.text}
      </a>
    ) : (
      item.text
    );

    return (
      <span className={className || undefined} key={`${item.text}-${index}`}>
        {content}
      </span>
    );
  });
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
