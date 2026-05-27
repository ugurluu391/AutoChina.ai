import type { Config } from "tailwindcss";

/**
 * AutoChina AI — Mərkəzi Design System Konfiqurasiyası
 * ⚠️ Bütün rənglər, gölgələr və animasiyalar burada və globals.css-də saxlanılır.
 * Yeniləmələr zamanı bu token-ləri DƏYİŞMƏYİN — yalnız genişləndirin.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          900: "var(--bg-900)",
          800: "var(--bg-800)",
          700: "var(--bg-700)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          2: "var(--surface-2)",
        },
        border: "var(--border)",
        "border-glow": "var(--border-glow)",
        content: {
          DEFAULT: "var(--text)",
          dim: "var(--text-dim)",
          muted: "var(--text-muted)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          2: "var(--accent-2)",
          3: "var(--accent-3)",
        },
        success: "var(--success)",
        warning: "var(--warning)",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        sm: "var(--radius-sm)",
      },
      boxShadow: {
        glow: "var(--shadow-glow)",
      },
      backgroundImage: {
        "grad-accent": "var(--grad-accent)",
        "grad-hero": "var(--grad-hero)",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        rise: "rise 0.7s cubic-bezier(.2,.7,.3,1) both",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
