"use client";

import { useState, type ReactNode } from "react";

type ProjectListItem = {
  id: string;
  masked: boolean;
  card: ReactNode;
};

export default function ProjectList({ items }: { items: ProjectListItem[] }) {
  const [showMasked, setShowMasked] = useState(false);
  const maskedCount = items.filter((item) => item.masked).length;
  const visibleItems = showMasked ? items : items.filter((item) => !item.masked);

  return (
    <>
      {maskedCount > 0 ? (
        <div className="mb-5 flex justify-end">
          <button
            aria-pressed={showMasked}
            className="border border-white/12 bg-black/24 px-3 py-2 font-mono text-xs uppercase tracking-[0.12em] text-white/58 transition hover:border-white/20 hover:text-white/80"
            onClick={() => setShowMasked((value) => !value)}
            type="button"
          >
            {showMasked ? "Hide masked" : `Show all (${maskedCount} hidden)`}
          </button>
        </div>
      ) : null}

      <ol className="grid gap-5">
        {visibleItems.map((item) => (
          <li key={item.id}>{item.card}</li>
        ))}
      </ol>
    </>
  );
}
