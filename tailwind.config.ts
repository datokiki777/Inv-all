import type { Config } from "tailwindcss";

// Single fixed theme. No dark-mode variant is registered on purpose —
// this app intentionally ships one considered design, not a toggle.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#141414",
          raised: "#1c1c1e",
          sunken: "#0d0d0e"
        },
        ink: {
          DEFAULT: "#f3f2ef",
          muted: "#a3a19c",
          faint: "#6b6a66"
        },
        accent: {
          DEFAULT: "#c98a4b",
          soft: "#e0a86d",
          contrast: "#141414"
        },
        line: "#2a2a2c",
        success: "#5ea36f",
        warning: "#d1a13c",
        danger: "#c9634f"
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"]
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "10px",
        lg: "16px"
      }
    }
  },
  plugins: []
} satisfies Config;
