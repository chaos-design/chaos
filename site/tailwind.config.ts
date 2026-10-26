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
          bg: "var(--chaos-bg)",
          chrome: "var(--chaos-chrome-bg)",
          "chrome-strong": "var(--chaos-chrome-bg-strong)",
          panel: "var(--chaos-panel)",
          "panel-raised": "var(--chaos-panel-raised)",
          line: "var(--chaos-line)",
          "line-strong": "var(--chaos-line-strong)",
          accent: "var(--chaos-accent)",
          "accent-dark": "var(--chaos-accent-dark)",
          "control-bg": "var(--chaos-control-bg)",
          "seg-bg": "var(--chaos-seg-bg)",
          "hover-bg": "var(--chaos-hover-bg)",
          "glow-orange": "var(--chaos-glow-orange)",
          "glow-cyan": "var(--chaos-glow-cyan)",
          "term-bg": "var(--chaos-term-bg)",
          "term-chrome": "var(--chaos-term-chrome)",
          "term-fg": "var(--chaos-term-fg)",
          "term-dim": "var(--chaos-term-dim)",
          "term-dim-soft": "var(--chaos-term-dim-soft)",
          "term-dim-80": "var(--chaos-term-dim-80)",
          "term-dim-70": "var(--chaos-term-dim-70)",
          "term-cursor": "var(--chaos-term-cursor)",
          success: "var(--chaos-success)",
          "command-fg": "var(--chaos-command-fg)",
          "hover-fg": "var(--chaos-hover-fg)",
          "copy-a": "var(--chaos-copy-a)",
          "copy-b": "var(--chaos-copy-b)",
          "copy-border": "var(--chaos-copy-border)",
          "copy-ok-a": "var(--chaos-copy-ok-a)",
          "copy-ok-b": "var(--chaos-copy-ok-b)",
          "copy-ok-border": "var(--chaos-copy-ok-border)",
          warn: "var(--chaos-warn)",
          "warn-fg": "var(--chaos-warn-fg)",
          "warn-bg": "var(--chaos-warn-bg)",
          "warn-border": "var(--chaos-warn-border)",
          "inspector-bg": "var(--chaos-inspector-bg)",
          "code-bg": "var(--chaos-code-bg)",
          "meta-fg": "var(--chaos-meta-fg)",
          "sub-fg": "var(--chaos-sub-fg)",
          "desc-fg": "var(--chaos-desc-fg)",
          "code-fg": "var(--chaos-code-fg)",
          "chip-fg": "var(--chaos-chip-fg)",
          "chip-bg": "var(--chaos-chip-bg)",
          "pick-fg": "var(--chaos-pick-fg)",
          "pick-border": "var(--chaos-pick-border)",
          "pick-bg": "var(--chaos-pick-bg)",
          "pick-bg-hover": "var(--chaos-pick-bg-hover)",
          "cursor-glow": "var(--chaos-cursor-glow)",
          "cursor-bg": "var(--chaos-cursor-bg)",
          "cursor-hi": "var(--chaos-cursor-hi)",
          "cursor-focus": "var(--chaos-cursor-focus)",
          "scanline": "var(--chaos-scanline)",
          "accent-glow": "var(--chaos-accent-glow)",
        },
        kolorist: {
          blue: "var(--k-blue)",
          cyan: "var(--k-cyan)",
          green: "var(--k-green)",
          lightCyan: "var(--k-lightCyan)",
          lightGreen: "var(--k-lightGreen)",
          lightMagenta: "var(--k-lightMagenta)",
          lightRed: "var(--k-lightRed)",
          magenta: "var(--k-magenta)",
          red: "var(--k-red)",
          yellow: "var(--k-yellow)",
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
