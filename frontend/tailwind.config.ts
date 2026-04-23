import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:       ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
        display:    ["var(--font-fraunces)", "Georgia", "serif"],
        mono:       ["var(--font-jetbrains)", "monospace"],
      },
      colors: {
        brand: {
          50:  "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
        },
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        floatY: {
          "0%,100%": { transform: "translateY(0)" },
          "50%":     { transform: "translateY(-12px)" },
        },
        scanline: {
          "0%":   { top: "5%",  opacity: "0" },
          "10%":  { opacity: "1" },
          "90%":  { opacity: "1" },
          "100%": { top: "90%", opacity: "0" },
        },
        pulseRing: {
          "0%":   { transform: "scale(1)",   opacity: "0.4" },
          "100%": { transform: "scale(1.65)", opacity: "0" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up":    "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards",
        "fade-in":    "fadeIn 0.8s ease forwards",
        "float":      "floatY 5s ease-in-out infinite",
        "scanline":   "scanline 3s ease-in-out infinite",
        "pulse-ring": "pulseRing 2s ease-out infinite",
        "shimmer":    "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;