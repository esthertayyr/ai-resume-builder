# Career Quest — Website Image Asset Manifest

**Art direction: "The Annotated Career"** — bright editorial magazine + hand-drawn notebook annotation + human photography.
Feel: bright · clean · editorial · human · intelligent · premium · eye-catching · welcoming.
Avoid: dark · scary · corporate-LinkedIn · generic-AI-SaaS · childish · gamified · 3D · overly colourful.

The machine-readable source of truth is [`lib/assets/manifest.ts`](../../lib/assets/manifest.ts). This document mirrors it for humans. **No live URLs are invented** — every path below is where the asset must be placed once produced.

## Palette

| Role | Name | Hex |
|---|---|---|
| Background | Paper White | `#FAFAF7` |
| Surface | Soft White | `#FFFFFF` |
| Text | Ink | `#111111` |
| Neutral | Warm Gray | `#F1F1EC` |
| Accent | Teacher Red | `#C92F32` |
| Support (muted, never all together) | Blue / Sage / Dusty Lavender / Ochre | `#6E86A8` / `#8DA18D` / `#9A8DB0` / `#C5A36A` |

> Note: these are the **art-direction / photography** colours. They are close to but distinct from the current app UI tokens (cream/navy/coral). Reconciling the two is a design decision for the redesign phase — flagged, not actioned here.

## Master sizes

| # | Name | Dimensions | Ratio | Transparent |
|---|---|---|---|---|
| 1 | Hero desktop | 1920×1080 | 16:9 | no |
| 2 | Hero mobile | 1080×1350 | 4:5 | no |
| 3 | Editorial feature | 1600×1200 | 4:3 | no |
| 4 | Editorial landscape | 1600×900 | 16:9 | no |
| 5 | Editorial portrait | 1200×1500 | 4:5 | no |
| 6 | Close-up / hand | 1200×1200 | 1:1 | no |
| 7 | Resume mockup | 1600×1200 | 4:3 | no |
| 8 | Resource / article | 1200×900 | 4:3 | no |
| 9 | Small card | 800×600 | 4:3 | no |
| 10 | Open Graph | 1200×630 | 1.91:1 | no |
| 11 | Favicon | 512×512 | 1:1 | optional |
| 12 | Hand-drawn icon | 1024×1024 | 1:1 | **yes** |
| 13 | Annotation element | 2000×2000 | 1:1 | **yes** |

## Asset plan (by homepage section)

Legend — **Priority:** `critical` = eager + preload (hero only); everything else `lazy`. **Alt:** blank = decorative (`alt=""`, hidden from assistive tech).

### HERO
| File | Purpose | Master | Ratio | Desktop | Mobile | Transparent | Priority | Alt |
|---|---|---|---|---|---|---|---|---|
| `hero/hero-desktop.jpg` | Human editorial poster / static fallback for the cinematic hero. **Leave negative space** for headline + CTA. | 1920×1080 | 16:9 | ✅ | — | no | critical | "A person at a bright desk writing notes — warm, editorial, hopeful." |
| `hero/hero-mobile.jpg` | Portrait hero poster; negative space top or bottom. | 1080×1350 | 4:5 | — | ✅ | no | critical | same as above |

### WHO IS THIS FOR — *situation categories, hand-drawn icons (NO row of people)*
| File | Category | Master | Ratio | Transparent | Priority | Alt |
|---|---|---|---|---|---|---|
| `icons/who/starting-out.png` | Starting Out | 1024×1024 | 1:1 | ✅ | medium | "Starting Out" |
| `icons/who/changing-careers.png` | Changing Careers | 1024×1024 | 1:1 | ✅ | medium | "Changing Careers" |
| `icons/who/next-step.png` | Ready For Your Next Step | 1024×1024 | 1:1 | ✅ | medium | "Ready For Your Next Step" |
| `icons/who/own-path.png` | Building Your Own Path | 1024×1024 | 1:1 | ✅ | medium | "Building Your Own Path" |
| `icons/who/wanting-more.png` | Wanting More | 1024×1024 | 1:1 | ✅ | medium | "Wanting More" |

### HOW IT WORKS — *consistent hand-drawn icon system (no photos)*
| File | Step | Master | Ratio | Transparent | Priority | Alt |
|---|---|---|---|---|---|---|
| `icons/how/experience.png` | experience | 1024×1024 | 1:1 | ✅ | medium | "Experience" |
| `icons/how/discover-skills.png` | discover skills | 1024×1024 | 1:1 | ✅ | medium | "Discover skills" |
| `icons/how/skills.png` | skills | 1024×1024 | 1:1 | ✅ | medium | "Skills" |
| `icons/how/resume.png` | resume | 1024×1024 | 1:1 | ✅ | medium | "Resume" |
| `icons/how/interview.png` | interview | 1024×1024 | 1:1 | ✅ | medium | "Interview" |
| `icons/how/next-move.png` | next move | 1024×1024 | 1:1 | ✅ | medium | "Next move" |

*Keep line weight, corner style and fill consistent across all 11 icons so WHO and HOW read as one set.*

### THAT COUNTS
| File | Purpose | Master | Ratio | Transparent | Priority | Alt |
|---|---|---|---|---|---|---|
| `editorial/that-counts-closeup.jpg` | Close-up: hand + pen + notebook/document. Must leave calm areas that **accept red hand-drawn annotations** on top. | 1200×1200 | 1:1 | no | high | "A hand writing in a notebook with a pen, seen close up." |

### RESUME SECTION
| File | Purpose | Master | Ratio | Transparent | Priority | Alt |
|---|---|---|---|---|---|---|
| `resume/resume-mockup.jpg` | Editorial resume mockup — before/after or annotated concept. | 1600×1200 | 4:3 | no | high | "A printed resume on a desk, with sections marked up by hand." |

### RESOURCES — *mix media; do NOT put people in every card*
| File | Topic | Master | Ratio | Transparent | Priority | Alt |
|---|---|---|---|---|---|---|
| `resources/first-resume.jpg` | Making your first resume (notebook + typography) | 1200×900 | 4:3 | no | low | "Making your first resume" |
| `resources/discover-skills.jpg` | Discovering hidden skills (hands + sticky notes) | 1200×900 | 4:3 | no | low | "Discovering hidden skills" |
| `resources/career-change.jpg` | Changing careers (hand-drawn diagram) | 1200×900 | 4:3 | no | low | "Changing careers" |
| `resources/interview-prep.jpg` | Preparing for interviews (documents, no face) | 1200×900 | 4:3 | no | low | "Preparing for interviews" |

*For compact card grids, an 800×600 (small card) crop of the same photo may be produced as `<name>@small.jpg`.*

### STANDALONE ANNOTATION ELEMENTS — *reusable Teacher-Red marks, transparent*
| File | Motif | Master | Ratio | Transparent | Priority | Alt |
|---|---|---|---|---|---|---|
| `annotations/circle.png` | circle around an element | 2000×2000 | 1:1 | ✅ | low | (decorative) |
| `annotations/arrow.png` | arrow pointing to an element | 2000×2000 | 1:1 | ✅ | low | (decorative) |
| `annotations/underline.png` | underline | 2000×2000 | 1:1 | ✅ | low | (decorative) |
| `annotations/star.png` | star / asterisk | 2000×2000 | 1:1 | ✅ | low | (decorative) |
| `annotations/bracket.png` | bracket grouping items | 2000×2000 | 1:1 | ✅ | low | (decorative) |

### GLOBAL
| File | Purpose | Master | Ratio | Transparent | Priority | Alt |
|---|---|---|---|---|---|---|
| `og/og-default.png` | Default Open Graph / share card ("You've done more." on paper white). | 1200×630 | 1.91:1 | no | low | "Career Quest — you've done more." |
| `/favicon.png` | App icon / favicon master (also feeds `app/icon.png` per Next.js convention). | 512×512 | 1:1 | optional | low | (decorative) |

## Image handling (implemented)

- **Components:** [`EditorialImage`](../../components/media/EditorialImage.tsx) (photography/editorial — aspect-ratio container + `object-fit`/`object-position` + responsive `sizes`) and [`HandDrawnIcon`](../../components/media/HandDrawnIcon.tsx) (transparent icons/annotations at explicit px). Both accept a manifest `assetId` so ratio/alt/priority come from this manifest.
- Built on **`next/image`** → automatic **WebP/AVIF** (enabled in `next.config.mjs`), responsive **srcset** from `sizes`, **lazy** loading by default, **eager/preload** only when `priority` is set (hero).
- **No layout shift:** every image reserves its box via the aspect-ratio container (or explicit width/height for icons). Until a real file exists, the component renders a neutral placeholder box — never a broken/fake URL.
- **Accessibility:** `alt` is required for meaningful images; decorative overlays use `alt=""` and are hidden from assistive tech.

## Adding real artwork (drop-in procedure)

Nothing else needs to change in code — the components already point at the paths below and only render a placeholder because the file is absent. To ship a real asset:

1. **Export at the master size** for its row (see the tables above), as the stated format (`.jpg` for photography, `.png` for transparent icons/annotations). Keep the exact filename and folder — e.g. `public/assets/hero/hero-desktop.jpg`.
2. **Drop it into `public/`** at that path. `next/image` handles WebP/AVIF conversion, responsive `srcset` and compression at build time — do not pre-optimise or rename.
3. That's it. The placeholder is replaced automatically with **zero layout shift** (the box was already reserved at the correct ratio). No component edit, no manifest edit for the standard assets.
4. **Global icon/OG files** are intentionally *not* referenced yet (so no 404s): when ready, add `app/icon.png` (512×512) and `app/opengraph-image.png` (1200×630) — Next.js auto-wires both from those conventional filenames; then set an `openGraph.images` entry in `lib/seo.ts` / `app/layout.tsx`.
5. To add a *new* asset slot, add an entry to `lib/assets/manifest.ts` (id + path + `size`) and reference it via `assetId` — ratio, alt and priority flow from the manifest.

## Directory layout

```
public/
├─ favicon.png                     (to produce)
└─ assets/
   ├─ MANIFEST.md                  (this file)
   ├─ hero/
   ├─ editorial/
   ├─ resume/
   ├─ resources/
   ├─ annotations/
   ├─ og/
   └─ icons/
      ├─ who/
      └─ how/
```
