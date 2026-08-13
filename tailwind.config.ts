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
        // ---- New semantic palette (preferred for new work) ----
        paper: "#FAFAF7", // primary background
        surface: "#FFFFFF", // cards / raised surfaces
        ink: "#111111", // primary text / headings
        red: "#C92F32", // Teacher Red — the signature accent
        warmgray: "#F1F1EC", // neutral fill / section banding
        // Optional supporting colours — never all at once.
        blue: "#6E86A8",
        sage: "#8DA18D",
        lavender: "#9A8DB0",
        ochre: "#C5A36A",

        // ---- Legacy token names, remapped to the new palette ----
        // (kept so /start, /discover, /interview, /preview keep working)
        canvas: "#FAFAF7", // was cream → paper
        navy: "#111111", // was navy → ink
        accent: "#C92F32", // was coral → Teacher Red
        card: "#FFFFFF",
        muted: "#5C5C57", // warm secondary text
        hair: "#E3E0D8", // warm hairline border
        sky: "#6E86A8", // → supporting blue
        mint: "#8DA18D", // → supporting sage
        sun: "#C5A36A", // → supporting ochre
        coral: "#9A8DB0", // → supporting lavender
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
