import type { Config } from "tailwindcss";

// "Career Adventure" design system — warm, light, premium editorial with subtle
// game mechanics. No dark/space/neon. Accents used sparingly (progress, discovery,
// selected states, key actions).
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F7F8FC", // primary background
        navy: "#172033", // dark text / headings
        accent: "#635BFF", // primary accent (indigo)
        sky: "#4F9CF9", // secondary blue
        mint: "#62D5B0", // optional
        sun: "#FFC857", // optional warm yellow
        coral: "#FF7A7A", // optional
        muted: "#5B6478", // secondary text
        hair: "#E6E9F2", // hairline borders
        card: "#FFFFFF",
      },
      fontFamily: {
        // Loaded via <link> in layout with robust fallbacks.
        display: ['"Sora"', '"Space Grotesk"', "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(23,32,51,0.04), 0 8px 24px -12px rgba(23,32,51,0.12)",
        lift: "0 2px 4px rgba(23,32,51,0.05), 0 18px 40px -16px rgba(23,32,51,0.20)",
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
        "draw": { "0%": { strokeDashoffset: "var(--dash)" }, "100%": { strokeDashoffset: "0" } },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 0.5s ease both",
        "word-in": "word-in 0.7s cubic-bezier(0.16,1,0.3,1) both",
        "pop": "pop 0.45s cubic-bezier(0.16,1,0.3,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
