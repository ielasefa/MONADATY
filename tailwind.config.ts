import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        black: "#171717",
        "black-soft": "#1E1E1E",
        "black-surface": "#252525",
        rouge: "#8F1020",
        "rouge-hover": "#A5152A",
        "rouge-dark": "#650A14",
        gold: "#C8A96A",
        "gold-light": "#D4BC7E",
        "gold-dark": "#A88A4A",
        white: "#FFFFFF",
        ivory: "#F8F6F2",
        muted: "#7A7670",
      },
      fontFamily: {
        display: ["DM Serif Display", "Georgia", "ui-serif", "serif"],
        body: ["DM Sans", "ui-sans-serif", "system-ui"],
      },
      fontSize: {
        "display-3xl": ["6.5rem", { lineHeight: "0.85", letterSpacing: "-0.05em", fontWeight: "400" }],
        "display-2xl": ["5rem", { lineHeight: "0.88", letterSpacing: "-0.045em", fontWeight: "400" }],
        "display-xl": ["4rem", { lineHeight: "0.90", letterSpacing: "-0.04em", fontWeight: "400" }],
        "display-lg": ["3rem", { lineHeight: "0.92", letterSpacing: "-0.035em", fontWeight: "400" }],
        "display-md": ["2.25rem", { lineHeight: "0.93", letterSpacing: "-0.03em", fontWeight: "400" }],
        "display-sm": ["1.75rem", { lineHeight: "0.95", letterSpacing: "-0.025em", fontWeight: "400" }],
        "display-xs": ["1.25rem", { lineHeight: "1.1", letterSpacing: "-0.015em", fontWeight: "500" }],
      },
      borderRadius: {
        btn: "8px",
        input: "6px",
        card: "12px",
      },
      boxShadow: {
        dark: "0 8px 24px -8px rgba(0,0,0,0.6)",
        premium: "0 4px 24px -4px rgba(0,0,0,0.5)",
        "premium-lg": "0 12px 40px -8px rgba(0,0,0,0.6)",
        "premium-xl": "0 20px 60px -12px rgba(0,0,0,0.7)",
        rouge: "0 4px 20px -2px rgba(143,16,32,0.25)",
        gold: "0 4px 16px -2px rgba(200,169,106,0.12)",
        card: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)",
        "card-hover": "0 8px 24px -4px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        "scale-in": "scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;