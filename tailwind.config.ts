import type { Config } from "tailwindcss";

// Single fixed theme (Graphite/Charcoal Dark). No dark-mode variant is
// registered on purpose — this app intentionally ships one considered
// design, not a toggle. Every color used anywhere in the app UI must come
// from this file — never hardcode a hex value in a component.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#202124", // app main background
          nav: "#292A2D", // bottom navigation background
          raised: "#2B2D31", // cards / sections background
          elevated: "#323438", // elevated cards / modal (bottom-sheet) background
          sunken: "#242629", // input / select / textarea background
          secondary: "#34363A" // secondary button background
        },
        ink: {
          DEFAULT: "#F5F5F5", // main text
          muted: "#C2C4C7", // secondary text
          faint: "#8B8E93" // muted / disabled text
        },
        accent: {
          DEFAULT: "#D89A5B", // primary accent
          hover: "#C8894E", // accent hover / pressed
          contrast: "#1C1C1C" // text/icons placed on an accent (or other light) background
        },
        line: {
          DEFAULT: "#3D4045", // dividers / subtle borders
          input: "#484B50", // input / select / textarea border
          button: "#4A4D52" // secondary button border
        },
        navInactive: "#9A9DA2", // bottom nav inactive icon/text
        switchOff: "#55585D", // switch OFF track
        success: "#81C784",
        warning: "#E6B566",
        danger: "#E57373"
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
