import type { Config } from "tailwindcss";

/**
 * TableNow design system.
 *
 * Inspired by a premium restaurant menu: warm ivory paper, soft sage green
 * accents, deep charcoal ink, thin divider rules, and calm whitespace.
 * The goal is an editorial, hospitality feel — never a "bot tool".
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Warm ivory paper backgrounds
        ivory: {
          DEFAULT: "#F7F4ED",
          50: "#FCFBF7",
          100: "#F7F4ED",
          200: "#EFEAE0",
          300: "#E5DECF",
        },
        // Soft sage green accent
        sage: {
          50: "#F1F4EF",
          100: "#E2E9DD",
          200: "#C5D2BB",
          300: "#A6BA98",
          400: "#849C73",
          500: "#6B8459", // primary accent
          600: "#566E47",
          700: "#445638",
          800: "#36452D",
        },
        // Deep charcoal ink
        ink: {
          DEFAULT: "#2B2A26",
          900: "#1F1E1B",
          800: "#2B2A26",
          700: "#3D3B35",
          600: "#55524A",
          500: "#6E6A60",
          400: "#928D81",
          300: "#B8B2A4",
        },
        // Muted warning / clay for "needs action" states
        clay: {
          100: "#F3E7DC",
          200: "#E4C9AE",
          500: "#B5703B",
          600: "#9A5C2E",
        },
        line: "#E2DCCF", // thin divider rule
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "Cambria", "serif"],
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display": ["clamp(2.75rem, 6vw, 5rem)", { lineHeight: "1.02", letterSpacing: "-0.02em" }],
      },
      letterSpacing: {
        label: "0.18em",
      },
      boxShadow: {
        // Minimal, soft shadows only
        card: "0 1px 2px rgba(43, 42, 38, 0.04), 0 8px 24px -16px rgba(43, 42, 38, 0.12)",
        drawer: "-12px 0 48px -24px rgba(43, 42, 38, 0.25)",
        float: "0 8px 30px -12px rgba(43, 42, 38, 0.28)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "fade-up": "fade-up 0.4s ease-out",
        "slide-in": "slide-in 0.32s cubic-bezier(0.22, 1, 0.36, 1)",
        "pulse-soft": "pulse-soft 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
