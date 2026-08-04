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
        // These reference *system* fonts only, deliberately — the app must
        // render correctly with zero network access, so no @font-face /
        // Google Fonts dependency is used. On Android, "sans" resolves to
        // Roboto (the OS's own UI font) with no download needed. "display"
        // prefers each platform's built-in serif for headings; "mono" is
        // used for a handful of monospaced figures (e.g. IBAN display).
        display: ["Georgia", "'Noto Serif'", "'Times New Roman'", "serif"],
        sans: [
          "-apple-system",
          "'Segoe UI'",
          "Roboto",
          "'Helvetica Neue'",
          "Arial",
          "sans-serif"
        ],
        mono: [
          "ui-monospace",
          "'SFMono-Regular'",
          "'Roboto Mono'",
          "Menlo",
          "Consolas",
          "monospace"
        ]
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
