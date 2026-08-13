import type { Config } from "tailwindcss";

// ============================================================
// THE ANNOTATED CAREER — design system
// Art direction: premium editorial magazine + artist's notebook + hand-drawn
// annotation + human editorial photography. Bright, intelligent, human, warm.
// ~85% neutral paper/ink, Teacher Red as the single signature accent used
// intentionally (annotations, underlines, emphasis, active states, CTA accents).
//
// Token NAMES from the previous brand are preserved and REMAPPED to the new
// palette so existing pages keep compiling; new semantic names (paper, ink, red,
// warmgray, blue, sage, lavender, ochre) are added for all new work.
// ============================================================
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    // Container widths (design token).
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", md: "2rem", lg: "2.5rem" },
      screens: { sm: "640px", md: "768px", lg: "1024px", xl: "1200px", "2xl": "1280px" },
    },
    extend: {
      colors: {
        // ---- Cool editorial palette (LOCKED brand system) ----
        paper: "#F7F8FA", // primary background (cool paper)
        surface: "#FFFFFF", // cards / raised surfaces
        ink: "#111318", // primary text / headings / structure
        red: "#E63946", // Signature / Teacher Red — the identity accent (used as a MARK, never a flood)
        warmgray: "#EEF0F3", // neutral fill / section banding (name kept; now cool)
        neutral: "#EEF0F3", // preferred name for the cool neutral fill
        border: "#D9DDE3", // preferred name for hairline borders
        // Blue is rare — possibility / future / next chapter only.
        blue: "#3157D5",
        "blue-soft": "#EAF0FF",
        "pale-blue": "#EAF0FF",
        // Retired warm supporting hues → collapsed to a quiet cool slate so no
        // beige/green/ochre survives (brand forbids extra colours / rainbow).
        sage: "#626872",
        lavender: "#626872",
        ochre: "#626872",

        // ---- Legacy token names, remapped to the cool palette ----
        // (kept so /start, /discover, /interview, /preview keep compiling)
        canvas: "#F7F8FA", // was cream → cool paper
        navy: "#111318", // → ink
        accent: "#E63946", // → Signature Red
        card: "#FFFFFF",
        muted: "#626872", // cool secondary text
        hair: "#D9DDE3", // cool hairline border
        sky: "#3157D5", // → editorial blue
        mint: "#626872", // → quiet slate
        sun: "#626872", // → quiet slate (was ochre/yellow — banned)
        coral: "#626872", // → quiet slate
      },
      fontFamily: {
        // Self-hosted via next/font (app/layout.tsx), exposed as CSS variables
        // with robust system fallbacks.
        // Headings: editorial high-contrast serif.
        display: ["var(--font-display)", "ui-serif", "Georgia", "Cambria", "serif"],
        serif: ["var(--font-display)", "ui-serif", "Georgia", "Cambria", "serif"],
        // Body: clean modern sans-serif.
        sans: ["var(--font-ui)", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        // Annotations: handwritten / hand-drawn.
        hand: ["var(--font-hand)", "ui-serif", "Segoe Script", "cursive"],
        // Small technical eyebrow labels.
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        // Editorial display scale (font-size + line-height + tracking tokens).
        "display-xl": ["clamp(2.75rem, 6vw, 5rem)", { lineHeight: "0.98", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(2.25rem, 4.5vw, 3.75rem)", { lineHeight: "1.02", letterSpacing: "-0.02em" }],
        "display-md": ["clamp(1.75rem, 3vw, 2.75rem)", { lineHeight: "1.06", letterSpacing: "-0.01em" }],
        "display-sm": ["clamp(1.375rem, 2vw, 1.875rem)", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
      },
      lineHeight: {
        tight: "1.05",
        snug: "1.2",
        relaxed: "1.7",
      },
      spacing: {
        // Section rhythm tokens.
        section: "clamp(4rem, 9vw, 8rem)",
        "section-sm": "clamp(2.5rem, 6vw, 4.5rem)",
      },
      maxWidth: {
        prose: "68ch",
        content: "1200px",
      },
      borderRadius: {
        card: "1rem",
        pill: "999px",
      },
      boxShadow: {
        // Soft warm-tinted shadows to sit on paper, not cold grey.
        soft: "0 1px 2px rgba(17,17,17,0.04), 0 10px 30px -16px rgba(17,17,17,0.14)",
        lift: "0 2px 6px rgba(17,17,17,0.06), 0 24px 48px -20px rgba(17,17,17,0.22)",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionDuration: {
        DEFAULT: "300ms",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "word-in": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        // Hand-drawn line / thread drawing on — pair with style={{ "--dash": length }}.
        draw: { "0%": { strokeDashoffset: "var(--dash)" }, "100%": { strokeDashoffset: "0" } },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 0.4s ease both",
        "word-in": "word-in 0.5s cubic-bezier(0.16,1,0.3,1) both",
        draw: "draw 1.2s cubic-bezier(0.16,1,0.3,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
