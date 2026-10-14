import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        chaos: {
          bg: "#07090e",
          panel: "#0d1118",
          "panel-raised": "#10151e",
          line: "rgba(148,163,196,0.14)",
          "line-strong": "rgba(148,163,196,0.28)",
          accent: "#f15335",
          "accent-dark": "#ff6a4a",
          "glow-orange": "rgba(241,83,53,0.16)",
          "glow-cyan": "rgba(108,207,224,0.12)",
          "term-bg": "#0a0e15",
          "term-chrome": "#0d1219",
          "term-fg": "#e6e9ef",
          "term-dim": "#78829a",
          "term-cursor": "#6ccfe0",
          success: "#58d68d",
        },
        kolorist: {
          blue: "#7aa6da",
          cyan: "#6ccfe0",
          green: "#7ec97e",
          lightCyan: "#a9e6ef",
          lightGreen: "#a9e2a9",
          lightMagenta: "#d3a7e2",
          lightRed: "#ef8fa8",
          magenta: "#c678dd",
          red: "#e06c75",
          yellow: "#e5c07b",
        },
      },
      fontFamily: {
        mono: [
          "SFMono-Regular",
          "Cascadia Code",
          "Liberation Mono",
          "ui-monospace",
          "monospace",
        ],
        sans: [
          "Avenir Next",
          "Avenir",
          "Segoe UI",
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "sans-serif",
        ],
      },
      boxShadow: {
        terminal: "0 24px 64px rgba(0,0,0,0.5)",
        "glow-accent": "0 6px 22px rgba(241,83,53,0.22)",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(-2px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "command-flash": {
          "0%": { color: "#6ccfe0", textShadow: "0 0 16px rgba(108,207,224,0.45)" },
          "100%": { color: "#eef1f6", textShadow: "none" },
        },
        // Inspector copy crossfade. Opacity + 4px translate only, so swapping
        // templates can never move the surrounding layout.
        "panel-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        // Terminal block caret. Ends visible so reduced-motion users keep a caret.
        "caret-blink": {
          "0%, 45%": { opacity: "1" },
          "50%, 95%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        // Ambient scanline sweeping the terminal body.
        scan: {
          "0%": { transform: "translateY(-110%)" },
          "100%": { transform: "translateY(780%)" },
        },
      },
      animation: {
        rise: "rise 520ms cubic-bezier(0.22,0.9,0.3,1) both",
        "fade-in": "fade-in 180ms ease both",
        "command-flash": "command-flash 460ms ease-out",
        "panel-in": "panel-in 200ms ease-out both",
        "caret-blink": "caret-blink 1.1s infinite",
        scan: "scan 7s linear infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
