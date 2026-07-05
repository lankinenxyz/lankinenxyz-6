"use client";

import { useEffect, useState } from "react";

export type NoteChapter = {
  id: string;
  title: string;
  level: number;
};

export default function NoteChapters({ chapters, scrollContainerId }: { chapters: NoteChapter[]; scrollContainerId: string }) {
  const [activeId, setActiveId] = useState(chapters[0]?.id ?? "");

  useEffect(() => {
    if (chapters.length === 0) {
      return;
    }

    const scrollContainer = document.getElementById(scrollContainerId);
    const headings = chapters
      .map((chapter) => document.getElementById(chapter.id))
      .filter((heading): heading is HTMLElement => Boolean(heading));

    if (!scrollContainer || headings.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleHeading = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

        if (visibleHeading?.target.id) {
          setActiveId(visibleHeading.target.id);
        }
      },
      {
        root: scrollContainer,
        rootMargin: "-12% 0px -72% 0px",
        threshold: 0,
      },
    );

    headings.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, [chapters, scrollContainerId]);

  if (chapters.length === 0) {
    return null;
  }

  function onChapterClick(chapterId: string) {
    document.getElementById(chapterId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(chapterId);
  }

  return (
    <nav aria-label="Post chapters" className="mt-8 border-t border-white/10 pt-5">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-white/38">Chapters</p>
      <ol className="mt-4 grid gap-1.5">
        {chapters.map((chapter) => {
          const isActive = chapter.id === activeId;

          return (
            <li key={chapter.id}>
              <button
                className={`w-full cursor-pointer border-l px-3 py-2 text-left text-sm leading-5 transition ${
                  isActive
                    ? "border-lime-100/72 bg-white/[0.07] text-white"
                    : "border-white/10 text-white/46 hover:border-white/24 hover:bg-white/[0.04] hover:text-white/76"
                } ${chapter.level === 3 ? "ml-3" : chapter.level === 2 ? "ml-1.5" : ""}`}
                onClick={() => onChapterClick(chapter.id)}
                type="button"
              >
                {chapter.title}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
