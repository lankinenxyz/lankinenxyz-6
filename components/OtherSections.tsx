"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const sections = [
  {
    title: "Investing",
    href: "/hobbies/investing",
    description: "Stock picks and market analysis",
    shortcut: "1",
  },
  {
    title: "Books",
    href: "/hobbies/books",
    description: "Books I have read",
    shortcut: "2",
  },
  {
    title: "中文",
    href: "/hobbies/chinese",
    description: "",
    shortcut: "3"
  },
  {
    title: "Running",
    href: "/hobbies/running",
    description: "Running log",
    shortcut: "4",
  },
  {
    title: "Travel",
    href: "/hobbies/travel",
    description: "Pictures and stories from my travels",
    shortcut: "5",
  },
  {
    title: "Watches",
    href: "/hobbies/watches",
    description: "My watch collection",
    shortcut: "6",
  },
  {
    title: "Poker",
    href: "/hobbies/poker",
    description: "",
    shortcut: "7"
  },
];

function getShortcutModifier() {
  if (typeof navigator === "undefined") {
    return "ctrl+alt";
  }

  return navigator.platform.toLowerCase().includes("mac") ? "⌥" : "ctrl+alt";
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

export default function OtherSections() {
  const router = useRouter();
  const [shortcutModifier] = useState(getShortcutModifier);

  useEffect(() => {
    const isMac = getShortcutModifier() === "⌥";

    function onKeyDown(event: KeyboardEvent) {
      if (isEditableTarget(event.target)) {
        return;
      }

      const isShortcutPressed = isMac
        ? event.altKey && !event.ctrlKey && !event.metaKey
        : event.ctrlKey && event.altKey && !event.metaKey;

      if (!isShortcutPressed || event.shiftKey) {
        return;
      }

      const section = sections.find((item) => item.shortcut === event.key || event.code === `Digit${item.shortcut}`);

      if (!section) {
        return;
      }

      event.preventDefault();
      router.push(section.href);
    }

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  return (
    <ol className="grid min-w-0 gap-4 sm:grid-cols-2">
      {sections.map((section, index) => (
        <li key={section.href}>
          <Link
            className="group flex h-full min-h-56 flex-col justify-between border border-white/10 bg-white/[0.055] p-5 backdrop-blur transition hover:border-white/20 hover:bg-white/[0.08] sm:p-6"
            href={section.href}
          >
            <div>
              <div className="flex items-start justify-between gap-4">
                <span className="relative grid min-w-16 justify-items-start font-mono text-xs uppercase tracking-[0.08em] text-white/34">
                  <span className="transition-opacity duration-300 group-hover:opacity-0">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="absolute left-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    suppressHydrationWarning
                  >
                    {shortcutModifier}+{section.shortcut}
                  </span>
                </span>
              </div>
              <h2 className="mt-8 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
                {section.title}
              </h2>
              <p className="mt-4 text-base leading-7 text-white/62">{section.description}</p>
            </div>

            <p className="mt-8 font-mono text-xs uppercase tracking-[0.12em] text-lime-100/58 transition group-hover:text-lime-100">
              Open section
            </p>
          </Link>
        </li>
      ))}
    </ol>
  );
}
