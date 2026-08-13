// ============================================================================
// The Annotated Career — website image asset manifest (single source of truth).
//
// Art direction: "The Annotated Career" — bright editorial magazine + hand-drawn
// notebook annotation + human photography. Bright, clean, editorial, human,
// premium. NOT dark, corporate-LinkedIn, generic-AI-SaaS, childish, gamified, 3D.
//
// This file declares INTENDED asset paths and their specs. It never invents live
// URLs — every `file` points to where the asset must live under /public once
// produced. Components read these specs so master sizes / ratios / alt / priority
// stay consistent. The human-readable version is public/assets/MANIFEST.md.
// ============================================================================

/** The 13 approved master sizes. `ratio` is width:height. */
export const MASTER_SIZES = {
  heroDesktop: { w: 1920, h: 1080, ratio: "16:9" },
  heroMobile: { w: 1080, h: 1350, ratio: "4:5" },
  editorialFeature: { w: 1600, h: 1200, ratio: "4:3" },
  editorialLandscape: { w: 1600, h: 900, ratio: "16:9" },
  editorialPortrait: { w: 1200, h: 1500, ratio: "4:5" },
  closeupHand: { w: 1200, h: 1200, ratio: "1:1" },
  resumeMockup: { w: 1600, h: 1200, ratio: "4:3" },
  resourceArticle: { w: 1200, h: 900, ratio: "4:3" },
  smallCard: { w: 800, h: 600, ratio: "4:3" },
  openGraph: { w: 1200, h: 630, ratio: "1.91:1" },
  favicon: { w: 512, h: 512, ratio: "1:1" },
  handDrawnIcon: { w: 1024, h: 1024, ratio: "1:1" },
  annotationElement: { w: 2000, h: 2000, ratio: "1:1" },
} as const;

export type MasterSizeKey = keyof typeof MASTER_SIZES;
export type AspectRatio = (typeof MASTER_SIZES)[MasterSizeKey]["ratio"];

/** Loading strategy — only the critical hero poster is eager/preloaded. */
export type Priority = "critical" | "high" | "medium" | "low";

export interface AssetSpec {
  /** Stable id used in code. */
  id: string;
  /** Intended path under /public. Does NOT exist until the asset is produced. */
  file: string;
  /** Section of the approved homepage (or global). */
  section:
    | "hero"
    | "who-is-this-for"
    | "how-it-works"
    | "that-counts"
    | "resume"
    | "resources"
    | "annotations"
    | "global";
  purpose: string;
  size: MasterSizeKey;
  desktop: boolean;
  mobile: boolean;
  /** Alt text guidance. Empty string means decorative (aria-hidden / alt=""). */
  alt: string;
  /** True when a transparent background is required (icons, annotations). */
  transparent: boolean;
  priority: Priority;
  /** eager only for the critical hero poster; everything else lazy. */
  loading: "eager" | "lazy";
}

// Helper to keep entries terse.
const A = (s: AssetSpec) => s;

export const ASSETS: AssetSpec[] = [
  // ---- HERO ---------------------------------------------------------------
  A({
    id: "hero-desktop",
    file: "/assets/hero/hero-desktop.jpg",
    section: "hero",
    purpose:
      "Primary human editorial hero poster / static fallback for the future cinematic hero. Composition MUST leave negative space (left or lower third) for headline + CTA.",
    size: "heroDesktop",
    desktop: true,
    mobile: false,
    alt: "A person at a bright desk writing notes — warm, editorial, hopeful.",
    transparent: false,
    priority: "critical",
    loading: "eager",
  }),
  A({
    id: "hero-mobile",
    file: "/assets/hero/hero-mobile.jpg",
    section: "hero",
    purpose: "Portrait hero poster for mobile. Negative space at top or bottom for headline + CTA.",
    size: "heroMobile",
    desktop: false,
    mobile: true,
    alt: "A person at a bright desk writing notes — warm, editorial, hopeful.",
    transparent: false,
    priority: "critical",
    loading: "eager",
  }),
  // Second artwork-only hero scene (A/B). Same negative-space zone as the primary
  // so the fixed HTML headline + CTA sit correctly over either. Loaded WITHOUT
  // priority (the SSR default is the primary; B is chosen client-side).
  A({
    id: "hero-desktop-b",
    file: "/assets/hero/hero-desktop-b.jpg",
    section: "hero",
    purpose:
      "Alternate desktop hero scene for random-on-load A/B. MUST share the primary's negative-space zone (left / lower third) so the fixed HTML headline + CTA still fit.",
    size: "heroDesktop",
    desktop: true,
    mobile: false,
    alt: "A person at a bright desk writing notes — warm, editorial, hopeful.",
    transparent: false,
    priority: "high",
    loading: "lazy",
  }),
  A({
    id: "hero-mobile-b",
    file: "/assets/hero/hero-mobile-b.jpg",
    section: "hero",
    purpose: "Alternate portrait hero scene for random-on-load A/B. Same negative-space zone as the primary mobile poster.",
    size: "heroMobile",
    desktop: false,
    mobile: true,
    alt: "A person at a bright desk writing notes — warm, editorial, hopeful.",
    transparent: false,
    priority: "high",
    loading: "lazy",
  }),

  // ---- WHO IS THIS FOR (situation categories, hand-drawn icons) -----------
  ...(
    [
      ["starting-out", "Starting Out", "a first sprout / seedling notebook doodle"],
      ["changing-careers", "Changing Careers", "a bending arrow / fork-in-the-road doodle"],
      ["next-step", "Ready For Your Next Step", "a rising staircase / step-up doodle"],
      ["own-path", "Building Your Own Path", "a hand-drawn winding trail doodle"],
      ["wanting-more", "Wanting More", "an upward spark / reaching doodle"],
    ] as const
  ).map(([slug, label, motif]) =>
    A({
      id: `who-${slug}`,
      file: `/assets/icons/who/${slug}.png`,
      section: "who-is-this-for",
      purpose: `Hand-drawn situation icon for the "${label}" category (no photos of people; ${motif}).`,
      size: "handDrawnIcon",
      desktop: true,
      mobile: true,
      alt: label,
      transparent: true,
      priority: "medium",
      loading: "lazy",
    }),
  ),

  // ---- HOW IT WORKS (consistent hand-drawn icon system) -------------------
  ...(
    [
      ["experience", "Experience", "a briefcase / notebook of past work"],
      ["discover-skills", "Discover skills", "a magnifying glass over notes"],
      ["skills", "Skills", "a labelled tag / badge doodle"],
      ["resume", "Resume", "a single document sheet doodle"],
      ["interview", "Interview", "a speech bubble / dialogue doodle"],
      ["next-move", "Next move", "a forward arrow / compass doodle"],
    ] as const
  ).map(([slug, label, motif]) =>
    A({
      id: `how-${slug}`,
      file: `/assets/icons/how/${slug}.png`,
      section: "how-it-works",
      purpose: `Hand-drawn step icon: "${label}" (${motif}). Consistent line weight across the set.`,
      size: "handDrawnIcon",
      desktop: true,
      mobile: true,
      alt: label,
      transparent: true,
      priority: "medium",
      loading: "lazy",
    }),
  ),

  // ---- THAT COUNTS --------------------------------------------------------
  A({
    id: "that-counts-closeup",
    file: "/assets/editorial/that-counts-closeup.jpg",
    section: "that-counts",
    purpose:
      "Editorial close-up: hand + pen + notebook/document. Must have calm areas that accept red hand-drawn annotations on top.",
    size: "closeupHand",
    desktop: true,
    mobile: true,
    alt: "A hand writing in a notebook with a pen, seen close up.",
    transparent: false,
    priority: "high",
    loading: "lazy",
  }),

  // ---- EDITORIAL CHAPTERS (story photography: evidence → future) ----------
  A({
    id: "editorial-evidence",
    file: "/assets/editorial/evidence.jpg",
    section: "that-counts",
    purpose:
      "Editorial 'evidence' chapter: documents / notes / desk objects that read as proof inside ordinary experience. Calm areas accept red annotation.",
    size: "editorialFeature",
    desktop: true,
    mobile: true,
    alt: "Papers and notes spread on a desk, examined closely.",
    transparent: false,
    priority: "medium",
    loading: "lazy",
  }),
  A({
    id: "editorial-next-move",
    file: "/assets/editorial/next-move.jpg",
    section: "that-counts",
    purpose: "Final cinematic 'next move / future' chapter image. Landscape, leaves space for closing headline.",
    size: "editorialLandscape",
    desktop: true,
    mobile: true,
    alt: "A person looking ahead — the next chapter of a career.",
    transparent: false,
    priority: "medium",
    loading: "lazy",
  }),
  A({
    id: "annotation-poster",
    file: "/assets/editorial/annotation-poster.jpg",
    section: "that-counts",
    purpose:
      "Pure annotation poster — a portrait editorial spread of the Career Thread + red marks over experience. Usable as a full-bleed campaign chapter.",
    size: "editorialPortrait",
    desktop: true,
    mobile: true,
    alt: "An annotated career page — red marks connecting moments of experience.",
    transparent: false,
    priority: "low",
    loading: "lazy",
  }),

  // ---- RESUME SECTION -----------------------------------------------------
  A({
    id: "resume-mockup",
    file: "/assets/resume/resume-mockup.jpg",
    section: "resume",
    purpose: "Editorial resume mockup showing a before/after or annotated-resume concept.",
    size: "resumeMockup",
    desktop: true,
    mobile: true,
    alt: "A printed resume on a desk, with sections marked up by hand.",
    transparent: false,
    priority: "high",
    loading: "lazy",
  }),

  // ---- RESOURCES (mix; NOT people in every card) --------------------------
  ...(
    [
      ["first-resume", "Making your first resume", "notebook + editorial typography"],
      ["discover-skills", "Discovering hidden skills", "hands sorting sticky notes"],
      ["career-change", "Changing careers", "a hand-drawn diagram / arrows"],
      ["interview-prep", "Preparing for interviews", "documents + coffee, no face"],
    ] as const
  ).map(([slug, label, motif]) =>
    A({
      id: `resource-${slug}`,
      file: `/assets/resources/${slug}.jpg`,
      section: "resources",
      purpose: `Resource/article image: "${label}" (${motif}). Vary the mix — do not put people in every card.`,
      size: "resourceArticle",
      desktop: true,
      mobile: true,
      alt: label,
      transparent: false,
      priority: "low",
      loading: "lazy",
    }),
  ),

  // ---- STANDALONE ANNOTATION ELEMENTS (reusable red marks) ----------------
  ...(
    [
      ["circle", "hand-drawn circle around an element"],
      ["arrow", "hand-drawn arrow pointing to an element"],
      ["underline", "hand-drawn underline"],
      ["star", "hand-drawn star / asterisk mark"],
      ["bracket", "hand-drawn bracket grouping items"],
    ] as const
  ).map(([slug, motif]) =>
    A({
      id: `annotation-${slug}`,
      file: `/assets/annotations/${slug}.png`,
      section: "annotations",
      purpose: `Reusable Teacher-Red annotation overlay: ${motif}. Transparent; layered over images/text.`,
      size: "annotationElement",
      desktop: true,
      mobile: true,
      alt: "", // decorative overlay
      transparent: true,
      priority: "low",
      loading: "lazy",
    }),
  ),

  // ---- GLOBAL (OG + favicon) ---------------------------------------------
  A({
    id: "og-default",
    file: "/assets/og/og-default.png",
    section: "global",
    purpose: "Default Open Graph / social share card. Headline 'You've done more.' on paper white.",
    size: "openGraph",
    desktop: true,
    mobile: true,
    alt: "The Annotated Career — you've done more than you think.",
    transparent: false,
    priority: "low",
    loading: "lazy",
  }),
  A({
    id: "favicon",
    file: "/favicon.png",
    section: "global",
    purpose: "App icon / favicon master (also feeds app/icon.png per Next.js convention).",
    size: "favicon",
    desktop: true,
    mobile: true,
    alt: "",
    transparent: true,
    priority: "low",
    loading: "lazy",
  }),
];

/** Look up a spec by id (throws in dev if unknown — catches typos early). */
export function getAsset(id: string): AssetSpec {
  const found = ASSETS.find((a) => a.id === id);
  if (!found) throw new Error(`Unknown asset id: ${id}`);
  return found;
}

/** Tailwind aspect-ratio class for each ratio (prevents layout shift). */
export const ASPECT_CLASS: Record<AspectRatio, string> = {
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  "4:5": "aspect-[4/5]",
  "1:1": "aspect-square",
  "1.91:1": "aspect-[1.91/1]",
};
