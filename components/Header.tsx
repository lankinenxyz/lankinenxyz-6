"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

const primaryLinks = [
  { label: "About", href: "/about", shortcut: "1" },
  { label: "Notes", href: "/notes", shortcut: "2" },
  { label: "Projects", href: "/projects", shortcut: "3" },
  { label: "Other", href: "/other", shortcut: "4" },
];

const otherLinks = [
  { href: "/other/investing", shortcut: "1" },
  { href: "/other/fitness", shortcut: "2" },
  { href: "/other/watches", shortcut: "3" },
  { href: "/other/travel", shortcut: "4" },
];

const contactEmail = "elias@lankinen.xyz";
const githubUrl = "https://github.com/lankinenxyz";
const linkedinUrl = "https://www.linkedin.com/in/eliaslankinen";

function getShortcutModifier() {
  if (typeof navigator === "undefined") {
    return "ctrl";
  }

  return navigator.platform.toLowerCase().includes("mac") ? "⌘" : "ctrl";
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shortcutModifier] = useState(getShortcutModifier);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const isMac = getShortcutModifier() === "⌘";

    function onKeyDown(event: KeyboardEvent) {
      const otherLink = otherLinks.find((item) => item.shortcut === event.key || event.code === `Digit${item.shortcut}`);
      const isOtherShortcutPressed = isMac
        ? event.altKey && !event.ctrlKey && !event.metaKey
        : event.ctrlKey && event.altKey && !event.metaKey;

      if (pathname.startsWith("/other") && isOtherShortcutPressed && !event.shiftKey && !isContactOpen && otherLink) {
        event.preventDefault();
        setIsMenuOpen(false);
        router.push(otherLink.href);

        return;
      }

      const isModifierPressed = isMac ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey;

      if (!isModifierPressed || event.altKey || event.shiftKey || isContactOpen) {
        return;
      }

      if (event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsMenuOpen(false);
        setIsContactOpen(true);
        setStatus("");

        return;
      }

      const link = primaryLinks.find((item) => item.shortcut === event.key || event.code === `Digit${item.shortcut}`);

      if (!link) {
        return;
      }

      event.preventDefault();
      setIsMenuOpen(false);
      router.push(link.href);
    }

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isContactOpen, pathname, router]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isContactOpen) {
      return;
    }

    nameInputRef.current?.select();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsContactOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isContactOpen]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const message = formData.get("message")?.toString().trim();

    setIsSubmitting(true);
    setStatus("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, message }),
      });

      if (!response.ok) {
        throw new Error("Contact request failed");
      }

      form.reset();
      setStatus("Message sent. I will get back to you soon.");
    } catch {
      setStatus(`Could not send the form. You can still write directly to ${contactEmail}.`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <nav className="flex items-start justify-between gap-3 font-mono text-xs uppercase tracking-[0.08em] text-zinc-100 sm:text-sm">
        <button
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation menu"
          className="grid size-10 shrink-0 cursor-pointer place-items-center border border-white/10 bg-white/[0.09] text-white/76 backdrop-blur transition hover:border-white/20 hover:bg-white/[0.16] hover:text-white lg:hidden"
          onClick={() => setIsMenuOpen((value) => !value)}
          type="button"
        >
          <span className="grid gap-1.5">
            <span className="block h-px w-4 bg-current" />
            <span className="block h-px w-4 bg-current" />
            <span className="block h-px w-4 bg-current" />
          </span>
        </button>

        <div className="hidden min-w-0 flex-1 gap-1 lg:flex">
          {primaryLinks.map((link, index) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                href={link.href}
                key={link.label}
                className={`group flex h-10 max-w-52 flex-1 items-center justify-between border px-4 backdrop-blur transition ${isActive
                  ? "border-white/28 bg-white/[0.18] text-white shadow-[0_0_18px_rgba(255,255,255,0.08)]"
                  : "border-white/10 bg-white/[0.09] text-white/86 hover:bg-white/[0.16]"
                  }`}
              >
                <span>{link.label}</span>
                <span
                  className={`relative grid min-w-12 justify-items-end ${isActive ? "font-semibold text-white/58" : "text-white/38"
                    }`}
                >
                  <span className="transition-opacity duration-300 group-hover:opacity-0">
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                  <span
                    className="absolute right-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    suppressHydrationWarning
                  >
                    {shortcutModifier}+{link.shortcut}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>

        <div className="flex shrink-0 flex-wrap justify-end gap-1">
          <a
            aria-label="Open GitHub profile"
            className="grid size-10 place-items-center border border-white/10 bg-white/[0.09] text-white/72 backdrop-blur transition hover:border-white/20 hover:bg-white/[0.16] hover:text-white"
            href={githubUrl}
            rel="noreferrer"
            target="_blank"
          >
            <GithubIcon />
          </a>
          <a
            aria-label="Open LinkedIn profile"
            className="grid size-10 place-items-center border border-white/10 bg-white/[0.09] text-white/72 backdrop-blur transition hover:border-white/20 hover:bg-white/[0.16] hover:text-white"
            href={linkedinUrl}
            rel="noreferrer"
            target="_blank"
          >
            <LinkedInIcon />
          </a>
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              setIsContactOpen(true);
              setStatus("");
            }}
            className="flex h-10 cursor-pointer items-center bg-white px-3 font-semibold text-black transition hover:bg-lime-100 sm:px-4"
          >
            Contact
          </button>
        </div>
      </nav>

      {isMenuOpen ? (
        <div className="mt-1 grid gap-1 font-mono text-xs uppercase tracking-[0.08em] lg:hidden">
          {primaryLinks.map((link, index) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={`flex h-11 items-center justify-between border px-4 backdrop-blur transition ${isActive
                  ? "border-white/28 bg-white/[0.18] text-white shadow-[0_0_18px_rgba(255,255,255,0.08)]"
                  : "border-white/10 bg-white/[0.09] text-white/76 hover:bg-white/[0.16] hover:text-white"
                  }`}
                href={link.href}
                key={link.href}
                onClick={() => setIsMenuOpen(false)}
              >
                <span>{link.label}</span>
                <span className={isActive ? "font-semibold text-white/58" : "text-white/38"}>
                  {(index + 1).toString().padStart(2, "0")}
                </span>
              </Link>
            );
          })}
        </div>
      ) : null}

      {isContactOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/68 px-3 py-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsContactOpen(false);
            }
          }}
        >
          <section
            aria-labelledby="contact-title"
            aria-modal="true"
            role="dialog"
            className="w-full max-w-lg border border-white/16 bg-[#07100c]/95 p-4 text-white shadow-2xl shadow-black/50 sm:p-6"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-lime-100/72">Contact</p>
                <h2 id="contact-title" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Start a conversation
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsContactOpen(false)}
                className="grid size-9 shrink-0 place-items-center border border-white/14 bg-white/8 font-mono text-lg text-white/76 transition hover:bg-white/14 hover:text-white"
                aria-label="Close contact form"
              >
                x
              </button>
            </div>

            <div className="mb-5 border border-white/10 bg-white/[0.06] p-3 font-mono text-xs uppercase tracking-[0.08em] text-white/72">
              <span className="block text-white/42">Email</span>
              <span className="mt-1 block break-all text-sm normal-case tracking-normal text-white sm:text-base">
                {contactEmail}
              </span>
            </div>

            <form className="grid gap-3" onSubmit={onSubmit}>
              <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.08em] text-white/62">
                Name *
                <input
                  ref={nameInputRef}
                  name="name"
                  required
                  className="h-11 border border-white/12 bg-black/24 px-3 font-sans text-sm normal-case tracking-normal text-white outline-none transition placeholder:text-white/28 focus:border-lime-100/60"
                  placeholder="Your name"
                />
              </label>

              <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.08em] text-white/62">
                Email *
                <input
                  name="email"
                  required
                  type="email"
                  className="h-11 border border-white/12 bg-black/24 px-3 font-sans text-sm normal-case tracking-normal text-white outline-none transition placeholder:text-white/28 focus:border-lime-100/60"
                  placeholder="you@example.com"
                />
              </label>

              <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.08em] text-white/62">
                Message *
                <textarea
                  name="message"
                  required
                  rows={5}
                  className="resize-none border border-white/12 bg-black/24 px-3 py-3 font-sans text-sm normal-case tracking-normal text-white outline-none transition placeholder:text-white/28 focus:border-lime-100/60"
                  placeholder="What would you like to talk about?"
                />
              </label>

              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 bg-white px-5 font-mono text-xs font-semibold uppercase tracking-[0.08em] text-black transition hover:bg-lime-100"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
                {status ? <p className="text-sm text-white/62">{status}</p> : null}
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}

function GithubIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49v-1.9c-2.78.62-3.37-1.22-3.37-1.22-.45-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1.01.07 1.54 1.06 1.54 1.06.9 1.58 2.36 1.12 2.94.86.09-.67.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.05A9.33 9.33 0 0 1 12 6.94c.85 0 1.7.12 2.5.34 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.46.1 2.72.64.72 1.03 1.64 1.03 2.76 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9v2.81c0 .27.18.59.69.49A10.08 10.08 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M5.37 21H2.26V8.98h3.11V21ZM3.82 7.34C2.82 7.34 2 6.5 2 5.48S2.82 3.66 3.82 3.66s1.82.82 1.82 1.82-.81 1.86-1.82 1.86ZM22 21h-3.1v-5.84c0-1.39-.03-3.18-1.93-3.18-1.94 0-2.24 1.52-2.24 3.08V21h-3.1V8.98h2.97v1.64h.04c.41-.78 1.43-1.93 2.94-1.93 3.14 0 3.72 2.07 3.72 4.76V21H22Z" />
    </svg>
  );
}
