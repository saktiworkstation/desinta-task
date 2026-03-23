import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#fef7f7",
        foreground: "#4a3040",
        pink: {
          50: "#fef1f7",
          100: "#fee5f0",
          200: "#fecce3",
          300: "#ffa2cb",
          400: "#ff68a8",
          500: "#ec4899",
          600: "#db2777",
          700: "#be185d",
          800: "#9d174d",
          900: "#831843",
        },
        rose: {
          50: "#fff1f2",
          100: "#ffe4e6",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
        },
        lavender: {
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
        },
      },
      fontFamily: {
        heading: ["var(--font-quicksand)", "sans-serif"],
        body: ["var(--font-nunito)", "sans-serif"],
        label: ["var(--font-poppins)", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 4px 20px rgba(236, 72, 153, 0.1)",
        glow: "0 0 20px rgba(236, 72, 153, 0.2)",
        card: "0 2px 12px rgba(236, 72, 153, 0.08)",
      },
      animation: {
        "sparkle": "sparkle 1.5s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "pulse-pink": "pulse-pink 2s ease-in-out infinite",
        "bounce-soft": "bounce-soft 0.5s ease-out",
      },
      keyframes: {
        sparkle: {
          "0%, 100%": { opacity: "0", transform: "scale(0)" },
          "50%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "pulse-pink": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(236, 72, 153, 0.4)" },
          "50%": { boxShadow: "0 0 0 10px rgba(236, 72, 153, 0)" },
        },
        "bounce-soft": {
          "0%": { transform: "scale(0.95)" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
