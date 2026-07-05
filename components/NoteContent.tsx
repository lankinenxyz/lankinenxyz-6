import type { NoteBlock, NoteRichText } from "@/lib/notion-notes";

export default function NoteContent({ blocks }: { blocks: NoteBlock[] }) {
  if (blocks.length === 0) {
    return <p className="text-sm text-white/42">No content.</p>;
  }

  return (
    <div className="grid gap-3 text-base leading-7 text-white/70">
      {blocks.map((block) => (
        <BlockRenderer block={block} key={block.id} />
      ))}
    </div>
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
