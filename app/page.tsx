"use client";

import { CTAButton } from "@/components/CTAButton";
import { CareerJourney } from "@/components/progress/CareerJourney";

// Landing page — a story, not a feature list (Career Adventure brief).
// Cinematic-but-friendly oversized typography, warm light theme.
export default function LandingPage() {
  return (
    <main className="mx-auto max-w-5xl px-6">
      {/* 1. Cinematic opening — words gently arrive */}
      <section className="flex min-h-[88vh] flex-col justify-center py-20">
        <div className="font-display text-6xl font-extrabold leading-[0.95] tracking-tight text-navy sm:text-8xl">
          <span className="block animate-word-in">YOU</span>
          <span className="block animate-word-in [animation-delay:180ms]">HAVE</span>
          <span className="block animate-word-in text-accent [animation-delay:360ms]">EXPERIENCE.</span>
        </div>
        <p className="animate-fade-up mt-8 max-w-xl text-xl text-muted [animation-delay:640ms]">
          You have more experience than you think. Let&apos;s discover what you&apos;ve got.
        </p>
        <div className="animate-fade-up mt-10 flex flex-col gap-4 sm:flex-row [animation-delay:760ms]">
          <CTAButton href="/start" variant="primary">
            Build My Resume
          </CTAButton>
          <CTAButton href="/start?have=1" variant="secondary">
            I Already Have a Resume
          </CTAButton>
        </div>
      </section>

      {/* 2. "That counts" — ordinary experience has value */}
      <section className="border-t border-hair py-20">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            "I only worked at a café.",
            "I only helped my family's business.",
            "I only ran my club's Instagram.",
          ].map((line) => (
            <div key={line} className="rounded-2xl bg-white p-6 shadow-soft">
              <p className="text-lg text-muted">&ldquo;{line}&rdquo;</p>
              <p className="mt-3 font-display text-2xl font-bold text-navy">
                THAT <span className="text-mint">COUNTS.</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Example: AI discovers responsibilities (illustrative, clearly suggestions) */}
      <section className="border-t border-hair py-20">
        <h2 className="font-display text-3xl font-bold text-navy sm:text-4xl">
          Tell us once. We&apos;ll help you unpack it.
        </h2>
        <p className="mt-3 max-w-xl text-muted">
          Say &ldquo;I worked as a cashier&rdquo; and we suggest what people commonly do — you pick only what you actually did.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-soft">
            <p className="mb-3 inline-block rounded-full bg-sky/10 px-3 py-1 text-xs font-medium text-sky">
              These are suggestions
            </p>
            <ul className="space-y-2 text-navy">
              {["Customer service", "Handled payments", "Restocked products", "Worked during busy periods"].map((s) => (
                <li key={s} className="flex items-center gap-3 rounded-lg border border-hair px-3 py-2">
                  <span className="h-4 w-4 rounded border border-hair" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col justify-center rounded-2xl bg-navy p-6 text-white">
            <p className="text-sm text-white/60">✨ 3 skills discovered</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Customer Service", "Cash Handling", "Teamwork"].map((s) => (
                <span key={s} className="animate-pop rounded-full bg-white/10 px-3 py-1.5 text-sm">
                  {s}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm text-white/70">Discovered from what you told us — never invented.</p>
          </div>
        </div>
      </section>

      {/* 4. Career Journey */}
      <section className="border-t border-hair py-20">
        <div className="rounded-3xl bg-white p-8 shadow-soft">
          <CareerJourney />
        </div>
      </section>

      {/* 5. Final CTA */}
      <section className="border-t border-hair py-24 text-center">
        <h2 className="font-display text-4xl font-extrabold leading-tight text-navy sm:text-5xl">
          Come in. We&apos;ll help you <span className="text-accent">figure this out.</span>
        </h2>
        <div className="mt-8 flex justify-center">
          <CTAButton href="/start" variant="primary">
            Build My Resume
          </CTAButton>
        </div>
        <p className="mt-6 text-sm text-muted">No account needed to start. Your progress saves automatically.</p>
      </section>
    </main>
  );
}
