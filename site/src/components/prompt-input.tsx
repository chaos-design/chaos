"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * East Asian Wide / Fullwidth characters advance two cells in a monospace font.
 * Anything outside these ranges is treated as one cell, which is exact for the
 * ASCII that these prompts normally receive.
 */
const WIDE_CHAR =
  /[\u1100-\u115f\u2e80-\ua4cf\ua960-\ua97f\uac00-\ud7a3\uf900-\ufaff\ufe10-\ufe19\ufe30-\ufe6f\uff00-\uff60\uffe0-\uffe6]/;

/** Measured advance width of `text` in monospace cells. */
function monoCells(text: string) {
  let cells = 0;
  for (const char of text) {
    cells += WIDE_CHAR.test(char) ? 2 : 1;
  }
  return cells;
}

/**
 * A borderless prompt field for the terminal, sized in `ch` so it is exactly as
 * wide as what it holds (or its placeholder) plus one cell for the caret.
 *
 * Deriving the width from the text instead of measuring a hidden mirror keeps
 * the first paint correct — no post-mount width snap — and costs nothing per
 * keystroke. The field scrolls internally past `maxCells` so a long value can
 * never push the row apart.
 */
const promptInputClass =
  "h-[26px] max-w-full shrink-0 rounded-[3px] border-0 bg-transparent p-0 font-mono text-[13.5px] text-chaos-term-fg caret-chaos-term-cursor shadow-none outline-none transition-colors placeholder:text-chaos-term-dim-soft selection:bg-chaos-cursor-hi focus-visible:bg-chaos-cursor-focus focus-visible:ring-0";

interface PromptInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> {
  /** Narrowest the field may shrink to, in cells. */
  minCells?: number;
  /** Widest the field may grow before its value scrolls inside, in cells. */
  maxCells?: number;
  className?: string;
}

export const PromptInput = React.forwardRef<
  HTMLInputElement,
  PromptInputProps
>(function PromptInput(
  { value, placeholder, minCells = 3, maxCells = 32, className, ...props },
  ref,
) {
  // An empty field sizes to its placeholder, which is what the user sees.
  const shown = String(value ?? "") || String(placeholder ?? "");
  const cells = Math.min(Math.max(monoCells(shown) + 1, minCells), maxCells);

  return (
    <Input
      ref={ref}
      value={value}
      placeholder={placeholder}
      {...props}
      className={cn(promptInputClass, className)}
      style={{ width: `${cells}ch` }}
    />
  );
});
