"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

const primaryLinks = [
  { label: "About", href: "/about", shortcut: "1" },
  { label: "Notes", href: "/notes", shortcut: "2" },
  { label: "Projects", href: "/projects", shortcut: "3" },
  { label: "Other", href: "/other", shortcut: "4" },
];

const contactEmail = "elias@lankinen.xyz";

function getShortcutModifier() {
  if (typeof navigator === "undefined") {
    return "ctrl";
  }

  return navigator.platform.toLowerCase().includes("mac") ? "⌘" : "ctrl";
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shortcutModifier] = useState(getShortcutModifier);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const isMac = getShortcutModifier() === "⌘";

    function onKeyDown(event: KeyboardEvent) {
      const isModifierPressed = isMac ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey;

      if (!isModifierPressed || event.altKey || event.shiftKey || isContactOpen) {
        return;
      }

      const link = primaryLinks.find((item) => item.shortcut === event.key);

      if (!link) {
        return;
      }

      event.preventDefault();
      router.push(link.href);
    }

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isContactOpen, router]);

  useEffect(() => {
    if (!isContactOpen) {
      return;
    }

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
        <div className="hidden min-w-0 flex-1 gap-1 md:flex">
          {primaryLinks.map((link, index) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                href={link.href}
                key={link.label}
                className={`group flex h-10 max-w-52 flex-1 items-center justify-between border px-4 backdrop-blur transition ${
                  isActive
                    ? "border-white/28 bg-white/[0.18] text-white shadow-[0_0_18px_rgba(255,255,255,0.08)]"
                    : "border-white/10 bg-white/[0.09] text-white/86 hover:bg-white/[0.16]"
                }`}
              >
                <span>{link.label}</span>
                <span
                  className={`relative grid min-w-12 justify-items-end ${
                    isActive ? "font-semibold text-white/58" : "text-white/38"
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
          <button
            type="button"
            onClick={() => {
              setIsContactOpen(true);
              setStatus("");
            }}
            className="flex h-10 cursor-pointer items-center bg-white px-3 font-semibold text-black transition hover:bg-lime-100 sm:px-4"
          >
            Contact
          </button>
        </div>
      </nav>

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
