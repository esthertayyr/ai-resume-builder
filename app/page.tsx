"use client";

import { useState } from "react";
import { CTAButton } from "@/components/CTAButton";
import { CareerPath } from "@/components/brand/CareerPath";
import { Label } from "@/components/brand/Label";

// Landing page — Career Quest. A story, not a feature list. Cinematic-but-friendly
// oversized typography, warm cream theme, coral action, blue interaction, mint
// discovery. The Career Path motif recurs. Signature line: YOU'VE DONE MORE.
export default function LandingPage() {
  return (
    <main className="mx-auto max-w-5xl px-6">
      {/* 1. Cinematic opening — YOU'VE DONE MORE. */}
      <section className="flex min-h-[86vh] flex-col justify-center py-16">
        <Label tone="accent" className="animate-fade-in">
          Career Quest / 01
        </Label>
        <div className="mt-5 font-display text-7xl font-extrabold leading-[0.92] tracking-tight text-navy sm:text-[8.5rem]">
          <span className="block animate-word-in">YOU&rsquo;VE</span>
          <span className="block animate-word-in [animation-delay:150ms]">DONE</span>
          <span className="block animate-word-in text-accent [animation-delay:300ms]">MORE.</span>
        </div>
        <p className="animate-fade-up mt-8 max-w-xl text-xl text-muted [animation-delay:560ms]">
          You just haven&apos;t learned how to tell the story yet.
        </p>
        <div className="animate-fade-up mt-10 flex flex-col gap-4 sm:flex-row [animation-delay:680ms]">
          <CTAButton href="/start" variant="primary">
            Build My Resume →
          </CTAButton>
          <CTAButton href="/start?have=1" variant="secondary">
            I Already Have a Resume
          </CTAButton>
        </div>

        {/* Interactive demo — communicates the value immediately */}
        <div className="animate-fade-up mt-14 [animation-delay:820ms]">
          <TryItDemo />
        </div>
      </section>

      {/* 2. THAT COUNTS — a major, expressive brand section */}
      <section className="border-t border-hair py-20">
        <Label tone="mint">That counts / 02</Label>
        <div className="mt-8 space-y-10">
          {[
            "I only worked at a café.",
            "I only helped my family's business.",
            "I only ran my club's Instagram.",
          ].map((line, i) => (
            <div
              key={line}
              className="animate-fade-up flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-6"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <p className="text-2xl text-muted sm:w-[46%] sm:text-3xl">&ldquo;{line}&rdquo;</p>
              <p className="font-display text-4xl font-extrabold tracking-tight text-navy sm:text-6xl">
                THAT <span className="text-mint">COUNTS.</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. AI Discovery — interactive, connects to the Career Path */}
      <section className="border-t border-hair py-20">
        <Label tone="sky">Discovery / 03</Label>
        <h2 className="mt-4 font-display text-3xl font-bold text-navy sm:text-4xl">
          Tell us once. We&apos;ll help you unpack it.
        </h2>
        <p className="mt-3 max-w-xl text-muted">
          Say what you did and we suggest what people commonly do — you pick only what was actually you.
        </p>
        <div className="mt-8">
          <DiscoveryDemo />
        </div>
      </section>

      {/* 4. Career Journey — the signature Career Path motif */}
      <section className="border-t border-hair py-20">
        <div className="rounded-3xl bg-white p-6 shadow-soft sm:p-10">
          <div className="mb-2 flex items-center justify-between">
            <Label tone="muted">Career journey / 04</Label>
            <Label tone="muted">5 milestones</Label>
          </div>
          <CareerPath
            nodes={[
              { label: "About", index: "01", state: "complete" },
              { label: "Experience", index: "02", state: "current" },
              { label: "Skills", index: "03", state: "upcoming" },
              { label: "Story", index: "04", state: "upcoming" },
              { label: "Resume", index: "05", state: "upcoming" },
            ]}
          />
        </div>
      </section>

      {/* 5. Final CTA */}
      <section className="border-t border-hair py-24 text-center">
        <h2 className="font-display text-4xl font-extrabold leading-tight text-navy sm:text-6xl">
          Come in. We&apos;ll help you <span className="text-accent">figure this out.</span>
        </h2>
        <div className="mt-8 flex justify-center">
          <CTAButton href="/start" variant="primary">
            Build My Resume →
          </CTAButton>
        </div>
        <p className="mt-6 text-sm text-muted">No account needed to start. Your progress saves automatically.</p>
      </section>
    </main>
  );
}

// ---- Interactive: "TRY IT" ---------------------------------------------------
const DEMO_SKILLS = ["Customer Service", "Cash Handling", "Teamwork", "Time Management"];

function TryItDemo() {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="rounded-3xl border border-hair bg-white p-6 shadow-soft sm:p-8">
      <Label tone="sky">Try it</Label>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="rounded-2xl bg-canvas px-4 py-2 text-lg text-navy">&ldquo;I worked at a café.&rdquo;</span>
        {!revealed && (
          <button
            onClick={() => setRevealed(true)}
            className="rounded-full bg-sky px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:brightness-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          >
            See what counts →
          </button>
        )}
      </div>

      {revealed && (
        <div className="mt-6">
          <p className="animate-word-in font-display text-4xl font-extrabold tracking-tight text-navy sm:text-5xl">
            THAT <span className="text-mint">COUNTS.</span>
          </p>
          <p className="animate-fade-in mt-4 label-mono text-mint [animation-delay:200ms]">✦ 4 skills discovered</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {DEMO_SKILLS.map((s, i) => (
              <span
                key={s}
                className="animate-pop rounded-full bg-mint/10 px-4 py-2 text-sm font-medium text-navy ring-1 ring-mint/30"
                style={{ animationDelay: `${300 + i * 90}ms` }}
              >
                {s}
              </span>
            ))}
          </div>
          <p className="mt-5 label-mono text-muted">AI suggests. You confirm.</p>
        </div>
      )}
    </div>
  );
}

// ---- Interactive: AI Discovery ----------------------------------------------
const DISCOVERY_ITEMS = ["Customer Service", "Handled Payments", "Restocked Products", "Busy Periods"];

function DiscoveryDemo() {
  const [picked, setPicked] = useState<string[]>(["Customer Service", "Handled Payments"]);
  const toggle = (s: string) =>
    setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-3xl border border-hair bg-white p-6 shadow-soft">
        <p className="text-lg text-muted">&ldquo;I was a cashier.&rdquo;</p>
        <p className="mt-4 label-mono text-navy">What did you actually do?</p>
        <p className="mt-1 text-xs text-muted">Suggestions — tap only what was you.</p>
        <ul className="mt-4 grid gap-3">
          {DISCOVERY_ITEMS.map((s) => {
            const on = picked.includes(s);
            return (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => toggle(s)}
                  aria-pressed={on}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-sky ${
                    on ? "border-sky bg-sky/10 text-navy ring-1 ring-sky" : "border-hair bg-white text-navy"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 flex-none items-center justify-center rounded-full border text-xs transition-colors ${
                      on ? "border-sky bg-sky text-white" : "border-hair text-transparent"
                    }`}
                    aria-hidden
                  >
                    ✓
                  </span>
                  {s}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex flex-col justify-center rounded-3xl bg-navy p-6 text-white">
        <p className="label-mono text-white/60">✦ {Math.min(picked.length, 3) || 0} skills discovered</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {["Customer Service", "Cash Handling", "Teamwork"].map((s, i) =>
            i < Math.max(picked.length, 0) ? (
              <span key={s} className="animate-pop rounded-full bg-white/10 px-4 py-2 text-sm">
                {s}
              </span>
            ) : null,
          )}
        </div>
        <p className="mt-6 label-mono text-white/70">AI suggests. You confirm.</p>
        <p className="mt-2 text-sm text-white/70">Discovered from what you told us — never invented.</p>
      </div>
    </div>
  );
}
