import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "oklch(0.98 0.003 250)",
        surface: "oklch(0.96 0.004 250)",
        surfaceHighlight: "oklch(0.94 0.01 255)",
        border: "oklch(0.87 0.008 250)",
        text: "oklch(0.22 0.01 250)",
        textMuted: "oklch(0.5 0.008 250)",
        accent: "oklch(0.5 0.14 255)",
        success: "oklch(0.5 0.14 145)",
        danger: "oklch(0.55 0.14 25)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "8px",
        lg: "10px",
      },
      spacing: {
        "4.5": "18px",
      },
    },
  },
  plugins: [],
} satisfies Config;
