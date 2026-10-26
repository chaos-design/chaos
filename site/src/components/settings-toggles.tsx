"use client";

import { Languages, Moon, Sun } from "lucide-react";

import { useLocale } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

/**
 * The header's right-hand controls: a 中/EN toggle and a light/dark toggle.
 * Terminal-styled (monospace, borderless, colour-only feedback) to match the
 * page — clicking re-skins or re-labels the whole view with no reflow.
 */
export function SettingsToggles() {
  const { locale, setLocale } = useLocale();
  const { theme, setTheme } = useTheme();

  const seg =
    "cursor-pointer border-0 bg-transparent p-0 font-mono text-chaos-term-dim transition-colors";

  return (
    <div className="flex items-center gap-2">
      <div role="group" aria-label="language" className="flex items-center gap-1">
        <Languages className="size-3.5 shrink-0 text-chaos-term-dim" />
        <button
          type="button"
          aria-pressed={locale === "zh"}
          onClick={() => setLocale("zh")}
          className={cn(
            seg,
            locale === "zh" &&
              "text-chaos-term-cursor underline underline-offset-[3px]",
          )}
        >
          中
        </button>
        <button
          type="button"
          aria-pressed={locale === "en"}
          onClick={() => setLocale("en")}
          className={cn(
            seg,
            locale === "en" &&
              "text-chaos-term-cursor underline underline-offset-[3px]",
          )}
        >
          EN
        </button>
      </div>

      <button
        type="button"
        aria-label={theme === "dark" ? "switch to light theme" : "switch to dark theme"}
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="cursor-pointer rounded-md border border-chaos-line bg-chaos-term-chrome p-1.5 text-chaos-term-dim transition-colors hover:border-chaos-line-strong hover:text-chaos-term-cursor"
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
