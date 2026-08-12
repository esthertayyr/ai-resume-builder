import type { ReactNode } from "react";
import { CareerPath } from "@/components/brand/CareerPath";
import { Label } from "@/components/brand/Label";

// ============================================================================
// Career Quest — social-media design system.
// Reusable, token-driven square cards (1:1) for producing brand visuals. All
// colour comes from the Tailwind tokens / CSS variables, so a rebrand flows
// through automatically. Render at any size via the `size` prop; export by
// screenshotting the node (or feeding the markup to a renderer).
//
// Signature phrases (constants below so they stay consistent everywhere):
//   THAT COUNTS.  ·  AI SUGGESTS. YOU CONFIRM.  ·  YOU'VE DONE MORE.
// ============================================================================

export const BRAND_PHRASES = {
  counts: "THAT COUNTS.",
  trust: "AI SUGGESTS. YOU CONFIRM.",
  product: "YOU'VE DONE MORE.",
} as const;

export type SocialFormat =
  | "that-counts"
  | "career-glow-up"
  | "career-discovery"
  | "career-confessions"
  | "resume-tips"
  | "skill-discovery"
  | "product-demo";

export const SOCIAL_FORMATS: { id: SocialFormat; name: string }[] = [
  { id: "that-counts", name: "THAT COUNTS" },
  { id: "career-glow-up", name: "CAREER GLOW-UP" },
  { id: "career-discovery", name: "CAREER DISCOVERY" },
  { id: "career-confessions", name: "CAREER CONFESSIONS" },
  { id: "resume-tips", name: "RESUME TIPS" },
  { id: "skill-discovery", name: "SKILL DISCOVERY" },
  { id: "product-demo", name: "PRODUCT DEMO" },
];

/** Square frame shared by every format. `size` is the rendered edge in px. */
function Frame({ code, children, size = 420 }: { code: string; children: ReactNode; size?: number }) {
  return (
    <div
      className="relative flex aspect-square flex-col overflow-hidden rounded-3xl border border-hair bg-canvas p-8 shadow-soft"
      style={{ width: size }}
    >
      <div className="flex items-center justify-between">
        <span className="font-display text-sm font-extrabold tracking-tight text-navy">Career Quest</span>
        <Label tone="muted">{code}</Label>
      </div>
      <div className="flex flex-1 flex-col justify-center">{children}</div>
    </div>
  );
}

export function SocialCard({
  format,
  size = 420,
  content,
}: {
  format: SocialFormat;
  size?: number;
  /** Optional overrides; sensible defaults per format otherwise. */
  content?: { statement?: string; skills?: string[]; tip?: string };
}) {
  switch (format) {
    case "that-counts":
      return (
        <Frame code="That counts / 01" size={size}>
          <p className="text-xl text-muted">&ldquo;{content?.statement ?? "I only worked at a café."}&rdquo;</p>
          <p className="mt-3 font-display text-6xl font-extrabold leading-[0.95] tracking-tight text-navy">
            THAT <span className="text-mint">COUNTS.</span>
          </p>
        </Frame>
      );

    case "career-glow-up":
      return (
        <Frame code="Glow-up / 02" size={size}>
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-4 shadow-soft">
              <Label tone="muted">Before</Label>
              <p className="mt-1 text-navy">Worked at a café.</p>
            </div>
            <p className="text-center font-display text-2xl font-bold text-accent">↓</p>
            <div className="rounded-2xl bg-white p-4 shadow-soft ring-1 ring-mint/30">
              <Label tone="mint">After</Label>
              <p className="mt-1 text-navy">
                Delivered friendly customer service and handled payments accurately during peak hours.
              </p>
            </div>
          </div>
        </Frame>
      );

    case "career-discovery":
      return (
        <Frame code="Discovery / 03" size={size}>
          <p className="mb-4 font-display text-3xl font-extrabold tracking-tight text-navy">
            Every job is a <span className="text-mint">quest.</span>
          </p>
          <CareerPath
            animate={false}
            nodes={[
              { label: "About", state: "complete" },
              { label: "Experience", state: "complete" },
              { label: "Skills", state: "current" },
              { label: "Story", state: "upcoming" },
              { label: "Resume", state: "upcoming" },
            ]}
          />
        </Frame>
      );

    case "career-confessions":
      return (
        <Frame code="Confessions / 04" size={size}>
          <Label tone="sky">Career confession</Label>
          <p className="mt-3 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-navy">
            &ldquo;{content?.statement ?? "I didn't think babysitting counted."}&rdquo;
          </p>
          <p className="mt-4 text-lg text-mint">It does. THAT COUNTS.</p>
        </Frame>
      );

    case "resume-tips":
      return (
        <Frame code="Resume tip / 05" size={size}>
          <Label tone="accent">Resume tip</Label>
          <p className="mt-3 font-display text-3xl font-bold leading-tight text-navy">
            {content?.tip ?? "Describe what you did — not just where you worked."}
          </p>
          <p className="mt-4 label-mono text-muted">{BRAND_PHRASES.trust}</p>
        </Frame>
      );

    case "skill-discovery":
      return (
        <Frame code="Skill found / 06" size={size}>
          <p className="label-mono text-mint">✦ Skills discovered</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(content?.skills ?? ["Customer Service", "Cash Handling", "Teamwork", "Time Management"]).map((s) => (
              <span key={s} className="rounded-full bg-mint/10 px-4 py-2 text-sm font-medium text-navy ring-1 ring-mint/30">
                {s}
              </span>
            ))}
          </div>
          <p className="mt-6 label-mono text-muted">{BRAND_PHRASES.trust}</p>
        </Frame>
      );

    case "product-demo":
      return (
        <Frame code="Product / 07" size={size}>
          <p className="font-display text-5xl font-extrabold leading-[0.95] tracking-tight text-navy">
            YOU&rsquo;VE <br /> DONE <span className="text-accent">MORE.</span>
          </p>
          <p className="mt-4 text-muted">Turn what you&apos;ve done into a resume — in minutes.</p>
          <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white">
            Build My Resume →
          </span>
        </Frame>
      );
  }
}
