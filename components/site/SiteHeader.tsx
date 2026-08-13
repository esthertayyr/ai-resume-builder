"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ds";
import { NAV, PRIMARY_CTA } from "@/lib/site";

// Editorial top navigation. Transparent over the hero, gains a paper background +
// hairline once the page scrolls. Mobile uses a clean, accessible menu drawer
// (not an oversized full-screen takeover). Fully keyboard operable; Escape closes.
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll + close on Escape while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-hair bg-paper/90 backdrop-blur" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-5 md:px-8">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight text-ink">
          The Annotated Career
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-ink/80 transition-colors hover:text-red"
            >
              {item.label}
            </Link>
          ))}
          <Button href={PRIMARY_CTA.href} size="md">
            {PRIMARY_CTA.label} →
          </Button>
        </nav>

        {/* Mobile trigger */}
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-ink md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(true)}
        >
          <span className="sr-only">Open menu</span>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden" role="dialog" aria-modal="true" aria-label="Menu" id="mobile-menu">
          <div
            className="fixed inset-0 z-40 bg-ink/30"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="fixed inset-y-0 right-0 z-50 flex w-[82%] max-w-xs flex-col bg-paper p-6 shadow-lift">
            <div className="flex items-center justify-between">
              <span className="label-mono text-muted">Menu</span>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-ink"
                onClick={() => setOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <nav aria-label="Mobile" className="mt-6 flex flex-col gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-2 py-3 text-lg font-medium text-ink transition-colors hover:text-red"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto pt-6">
              <Button href={PRIMARY_CTA.href} size="lg" className="w-full" >
                {PRIMARY_CTA.label} →
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
