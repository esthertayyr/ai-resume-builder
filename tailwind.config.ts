import type { Config } from "tailwindcss";

// "Career Quest" design system — warm cream, deep navy, coral action, blue
// interaction, mint discovery. Friendly, expressive, premium editorial. ~80%
// neutral / 20% colour. No neon, no space/cyberpunk, no heavy gradients.
// Signature motif: THE CAREER PATH (curved line + milestones). Token NAMES are
// stable — only their values changed in the rebrand.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#FFF9F2", // warm cream — primary background
        navy: "#17233B", // deep navy — primary text / headings
        accent: "#FF5C5C", // coral — major CTAs & statements
        sky: "#4D8DFF", // blue — interactive elements
        mint: "#49C6A6", // teal-green — discovery & confirmed
        sun: "#FFC857", // warm yellow — sparing highlights
        coral: "#FF8A65", // soft orange — secondary emphasis
        muted: "#657084", // secondary text
        hair: "#E8E3DA", // warm hairline borders
        card: "#FFFFFF",
      },
      fontFamily: {
        // Loaded via <link> in layout with robust fallbacks.
        display: ['"Plus Jakarta Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ['"DM Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        // Warm-tinted shadows to sit on cream, not cold grey.
        soft: "0 1px 2px rgba(23,35,59,0.04), 0 8px 24px -12px rgba(23,35,59,0.12)",
        lift: "0 2px 4px rgba(23,35,59,0.05), 0 18px 40px -16px rgba(23,35,59,0.22)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "word-in": {
          "0%": { opacity: "0", transform: "translateY(20px) scale(0.96)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "pop": {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "60%": { transform: "scale(1.08)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        // Career Path line drawing on — pair with style={{ "--dash": length }}.
        "draw": { "0%": { strokeDashoffset: "var(--dash)" }, "100%": { strokeDashoffset: "0" } },
        // Gentle milestone "arrival" pulse.
        "ping-soft": {
          "0%": { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(255,92,92,0.35)" },
          "70%": { transform: "scale(1)", boxShadow: "0 0 0 10px rgba(255,92,92,0)" },
          "100%": { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(255,92,92,0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 0.4s ease both",
        "word-in": "word-in 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "pop": "pop 0.4s cubic-bezier(0.16,1,0.3,1) both",
        "draw": "draw 1.1s cubic-bezier(0.16,1,0.3,1) both",
        "ping-soft": "ping-soft 1.6s ease-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
