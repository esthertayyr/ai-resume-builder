import type { Metadata } from "next";
import { CareerPath } from "@/components/brand/CareerPath";
import { Label } from "@/components/brand/Label";
import { SOCIAL_FORMATS, SocialCard, BRAND_PHRASES } from "@/components/brand/social/SocialCard";

// Internal brand / design-system reference (not linked from the product). Shows the
// palette, type scale, the Career Path motif and every social-media format so they
// can be reproduced consistently. Not indexed.
export const metadata: Metadata = { robots: { index: false, follow: false } };

const SWATCHES: { name: string; token: string; hex: string; note: string }[] = [
  { name: "canvas", token: "bg-canvas", hex: "#FFF9F2", note: "primary background" },
  { name: "navy", token: "bg-navy", hex: "#17233B", note: "primary text" },
  { name: "accent", token: "bg-accent", hex: "#FF5C5C", note: "coral — CTAs" },
  { name: "sky", token: "bg-sky", hex: "#4D8DFF", note: "interaction" },
  { name: "mint", token: "bg-mint", hex: "#49C6A6", note: "discovery / confirmed" },
  { name: "sun", token: "bg-sun", hex: "#FFC857", note: "sparing highlight" },
  { name: "coral", token: "bg-coral", hex: "#FF8A65", note: "secondary emphasis" },
  { name: "muted", token: "bg-muted", hex: "#657084", note: "secondary text" },
  { name: "hair", token: "bg-hair", hex: "#E8E3DA", note: "hairline borders" },
  { name: "card", token: "bg-card", hex: "#FFFFFF", note: "surfaces" },
];

export default function BrandPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <Label tone="accent">Career Quest / brand</Label>
      <h1 className="mt-3 font-display text-5xl font-extrabold tracking-tight text-navy">Design system</h1>
      <p className="mt-3 max-w-xl text-muted">
        Everything you&apos;ve done counts. Signature phrases: <b className="text-navy">{BRAND_PHRASES.product}</b> ·{" "}
        <b className="text-navy">{BRAND_PHRASES.counts}</b> · <b className="text-navy">{BRAND_PHRASES.trust}</b>
      </p>

      {/* Colour */}
      <section className="mt-14">
        <Label tone="muted">Colour / 01</Label>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {SWATCHES.map((s) => (
            <div key={s.name} className="rounded-2xl border border-hair bg-white p-3 shadow-soft">
              <div className={`h-16 w-full rounded-xl border border-hair ${s.token}`} />
              <p className="mt-2 font-display text-sm font-bold text-navy">{s.name}</p>
              <p className="label-mono text-muted">{s.hex}</p>
              <p className="mt-1 text-xs text-muted">{s.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Type */}
      <section className="mt-14">
        <Label tone="muted">Type / 02</Label>
        <div className="mt-4 space-y-3 rounded-2xl border border-hair bg-white p-6 shadow-soft">
          <p className="font-display text-5xl font-extrabold tracking-tight text-navy">Plus Jakarta Sans</p>
          <p className="font-sans text-lg text-navy">Inter — body, controls, forms and descriptions.</p>
          <p className="label-mono text-muted">DM Mono — technical labels · CAREER JOURNEY / 03</p>
        </div>
      </section>

      {/* Career Path motif */}
      <section className="mt-14">
        <Label tone="muted">Motif / 03 — the Career Path</Label>
        <div className="mt-4 rounded-3xl border border-hair bg-white p-8 shadow-soft">
          <CareerPath
            nodes={[
              { label: "About", index: "01", state: "complete" },
              { label: "Experience", index: "02", state: "complete" },
              { label: "Skills", index: "03", state: "current" },
              { label: "Story", index: "04", state: "upcoming" },
              { label: "Resume", index: "05", state: "upcoming" },
            ]}
          />
        </div>
      </section>

      {/* Social formats */}
      <section className="mt-14">
        <Label tone="muted">Social / 04 — reusable formats</Label>
        <div className="mt-4 flex flex-wrap gap-6">
          {SOCIAL_FORMATS.map((f) => (
            <div key={f.id} className="space-y-2">
              <Label tone="navy">{f.name}</Label>
              <SocialCard format={f.id} size={360} />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
