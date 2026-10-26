"use client";

import { Languages, Moon, Sun } from "lucide-react";

import { useLocale } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

/**
 * The header's right-hand controls: a 中/EN language segment and a light/dark
 * toggle, grouped in one bordered pill so they read as a single unit instead
 * of a loose row of glyphs.
 *
 * Interaction is colour- + background-only (no reflow): the active segment
 * carries a filled pill with a soft accent glow, every control has a hover
 * background, and keyboard focus lands on a visible ring. Both preferences
 * persist to localStorage and are restored before first paint (layout.tsx).
 */
export function SettingsToggles() {
  const { locale, setLocale, t } = useLocale();
  const { theme, setTheme } = useTheme();

  const seg =
    "rounded-md px-2 py-1 font-mono text-[12px] leading-none " +
    "cursor-pointer text-chaos-term-dim " +
    "transition-[background-color,color,box-shadow] duration-150 " +
    "hover:bg-chaos-hover-bg hover:text-chaos-term-fg " +
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-chaos-term-cursor";

  const activeSeg =
    "bg-chaos-cursor-bg text-chaos-term-cursor shadow-[0_0_10px_var(--chaos-cursor-glow)] hover:bg-chaos-cursor-bg hover:text-chaos-term-cursor";

  return (
    <div
      role="group"
      aria-label="preferences"
      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-chaos-line bg-chaos-control-bg p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
    >
      {/* Language */}
      <div
        role="group"
        aria-label={t.langLabel}
        className="flex items-center gap-0.5 rounded-md bg-chaos-seg-bg p-0.5"
      >
        <Languages
          aria-hidden
          className="mx-0.5 size-3.5 shrink-0 text-chaos-term-dim"
        />
        <button
          type="button"
          aria-pressed={locale === "zh"}
          title="中文"
          onClick={() => setLocale("zh")}
          className={cn(seg, locale === "zh" && activeSeg)}
        >
          中
        </button>
        <button
          type="button"
          aria-pressed={locale === "en"}
          title="English"
          onClick={() => setLocale("en")}
          className={cn(seg, locale === "en" && activeSeg)}
        >
          EN
        </button>
      </div>

      {/* A hairline keeps the two controls visually distinct. */}
      <span aria-hidden className="h-5 w-px shrink-0 bg-chaos-line" />

      {/* Theme */}
      <button
        type="button"
        aria-label={theme === "dark" ? t.themeToLight : t.themeToDark}
        title={theme === "dark" ? t.themeToLight : t.themeToDark}
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className={cn(
          "cursor-pointer rounded-md p-1.5 text-chaos-term-dim",
          "transition-[background-color,color] duration-150",
          "hover:bg-chaos-hover-bg hover:text-chaos-term-cursor",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-chaos-term-cursor",
        )}
      >
        {theme === "dark" ? (
          <Sun className="size-4" />
        ) : (
          <Moon className="size-4" />
        )}
      </button>
    </div>
  );
}
