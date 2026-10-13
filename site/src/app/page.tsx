"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

import { CHAOS_TEMPLATES } from "@/data/templates";
import type { ChaosTemplate } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const PM_ORDER = ["npm", "pnpm", "yarn", "bun"] as const;
type Pm = (typeof PM_ORDER)[number];

// kolorist name -> static Tailwind text color (kept static so the JIT
// compiler can see the classes; arbitrary interpolation would be purged).
const COLOR_CLASS: Record<string, string> = {
  blue: "text-kolorist-blue",
  cyan: "text-kolorist-cyan",
  green: "text-kolorist-green",
  lightCyan: "text-kolorist-lightCyan",
  lightGreen: "text-kolorist-lightGreen",
  lightMagenta: "text-kolorist-lightMagenta",
  lightRed: "text-kolorist-lightRed",
  magenta: "text-kolorist-magenta",
  red: "text-kolorist-red",
  yellow: "text-kolorist-yellow",
  default: "text-chaos-term-fg",
};

const colorClass = (t: ChaosTemplate) =>
  COLOR_CLASS[t.color] ?? COLOR_CLASS.default;

// Command forms mirror the usage documented in the repository README:
// npm 7+, yarn and pnpm need `--` before flags passed to the created package;
// bun passes them directly.
const buildCommand = (pm: Pm, dir: string, alias: string) => {
  const name = dir.trim() || "chaos-project";
  if (pm === "npm") {
    return `npm create chaos@latest ${name} -- --template ${alias}`;
  }
  return `${pm} create chaos ${name} --template ${alias}`;
};

const choiceMeta = (t: ChaosTemplate) => {
  const alias = t.alias && t.alias !== t.id ? ` | ${t.alias}` : "";
  return `${t.categoryLabel} | ${t.id}${alias}`;
};

const matchesFilter = (t: ChaosTemplate, keyword: string) => {
  if (!keyword) return true;
  const haystack = [t.title, t.alias, t.id, t.categoryLabel, t.description]
    .join(" ")
    .toLowerCase();
  return haystack.includes(keyword);
};

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export default function Page() {
  const templates = CHAOS_TEMPLATES;
  const [pm, setPm] = useState<Pm>("pnpm");
  const [dir, setDir] = useState("my-app");
  const [filter, setFilter] = useState("");
  const [templateId, setTemplateId] = useState<string | null>(
    templates[0]?.id ?? null,
  );
  const [cursor, setCursor] = useState(0);
  const [copied, setCopied] = useState(false);

  const commandRef = useRef<HTMLElement>(null);

  const visible = useMemo(
    () => templates.filter((t) => matchesFilter(t, filter.trim().toLowerCase())),
    [templates, filter],
  );

  const activeIndex = Math.min(cursor, Math.max(0, visible.length - 1));
  const selectedTemplate =
    templates.find((t) => t.id === templateId) ?? null;
  const command = selectedTemplate
    ? buildCommand(pm, dir, selectedTemplate.alias)
    : "";

  // Keep the pointer on the submitted template when it survives a filter;
  // otherwise clamp it into range.
  useEffect(() => {
    const idx = visible.findIndex((t) => t.id === templateId);
    if (idx >= 0) {
      setCursor(idx);
    } else {
      setCursor((c) => Math.min(c, Math.max(0, visible.length - 1)));
    }
  }, [visible, templateId]);

  // Brief cyan highlight whenever the generated command changes.
  useEffect(() => {
    const el = commandRef.current;
    if (!el || !command) return;
    el.classList.remove("animate-command-flash");
    void el.offsetWidth;
    el.classList.add("animate-command-flash");
  }, [command]);

  // Arrow keys move the pointer and Enter submits, like the real prompt.
  // Skipped while typing in an input so text editing keeps its keys.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setCursor((c) => Math.min(c + 1, Math.max(0, visible.length - 1)));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setCursor((c) => Math.max(c - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const t = visible[activeIndex];
        if (t) setTemplateId(t.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, activeIndex]);

  const handleCopy = async () => {
    if (!command) return;
    const ok = await copyText(command);
    setCopied(ok);
    window.setTimeout(() => setCopied(false), 1600);
    if (!ok) {
      const el = commandRef.current;
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  };

  const inputClass =
    "h-auto w-[26ch] min-w-[8ch] border-0 bg-transparent p-0 font-mono text-chaos-term-fg caret-[#6ccfe0] focus-visible:ring-0";

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-chaos-line bg-[rgba(10,13,19,0.82)] backdrop-blur-md">
        <div className="mx-auto flex max-w-[1060px] flex-wrap items-baseline gap-4 px-6 py-5">
          <a
            href="./"
            className="font-mono text-lg font-bold text-chaos-term-fg no-underline"
          >
            <span
              className="text-chaos-accent"
              style={{ textShadow: "0 0 18px rgba(241,83,53,0.45)" }}
            >
              chaos
            </span>
            <span className="font-normal text-chaos-term-dim"> / design</span>
          </a>
          <p className="m-0 flex-1 text-chaos-term-dim">
            选一个模板，复制命令，直接开跑。
          </p>
          <a
            href="https://github.com/chaos-design/chaos/blob/main/docs/templates.md"
            target="_blank"
            rel="noreferrer"
            className="border-b border-chaos-line-strong pb-px text-chaos-term-fg no-underline transition-colors hover:border-chaos-accent hover:text-chaos-accent-dark"
          >
            模板文档
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-[1060px] px-6">
        <Card className="relative mt-10 mb-8 animate-rise overflow-hidden rounded-2xl border-chaos-line bg-chaos-term-bg shadow-terminal">
          <div className="flex items-center gap-2 border-b border-chaos-line bg-chaos-term-chrome px-4 py-3">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{
                background: "#f15335",
                boxShadow: "0 0 10px rgba(241,83,53,0.5)",
              }}
            />
            <span className="h-2.5 w-2.5 rounded-full bg-[#e5c07b]" />
            <span className="h-2.5 w-2.5 rounded-full bg-chaos-success" />
            <span className="ml-2 font-mono text-xs text-chaos-term-dim">
              create-chaos — 模板选择
            </span>
          </div>

          <div className="overflow-x-auto px-5 py-5 font-mono text-[13.5px] leading-[1.95]">
            {/* Filter */}
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-bold text-[#c678dd]">?</span>
              <label htmlFor="filter-input" className="font-bold text-chaos-term-fg">
                Filter templates:
              </label>
              <span className="text-chaos-term-dim">›</span>
              <Input
                id="filter-input"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="(all)"
                spellCheck={false}
                autoComplete="off"
                className={inputClass}
              />
              <span className="text-chaos-term-dim">- Leave empty to list all.</span>
            </div>

            {/* Project name */}
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-bold text-[#c678dd]">?</span>
              <label htmlFor="dir-input" className="font-bold text-chaos-term-fg">
                Project name:
              </label>
              <span className="text-chaos-term-dim">›</span>
              <Input
                id="dir-input"
                value={dir}
                onChange={(e) => setDir(e.target.value)}
                spellCheck={false}
                autoComplete="off"
                className="h-auto w-[20ch] min-w-[8ch] border-0 bg-transparent p-0 font-mono text-chaos-term-fg caret-[#6ccfe0] focus-visible:ring-0"
              />
            </div>

            {/* Package manager */}
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-bold text-[#c678dd]">?</span>
              <span className="font-bold text-chaos-term-fg">Package manager:</span>
              <span className="text-chaos-term-dim">›</span>
              <div className="inline-flex gap-4">
                {PM_ORDER.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPm(p)}
                    aria-pressed={pm === p}
                    className={cn(
                      "cursor-pointer border-0 bg-transparent p-0 font-mono text-chaos-term-dim transition-colors hover:text-[#b9c1d0]",
                      pm === p &&
                        "text-chaos-term-cursor underline underline-offset-[3px]",
                    )}
                    style={
                      pm === p
                        ? { textShadow: "0 0 14px rgba(108,207,224,0.35)" }
                        : undefined
                    }
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected template head */}
            <div className="flex flex-wrap items-baseline gap-2">
              <span
                className={cn(
                  "font-bold",
                  selectedTemplate ? "text-chaos-success" : "text-[#c678dd]",
                )}
              >
                {selectedTemplate ? "✔" : "?"}
              </span>
              <span className="font-bold text-chaos-term-fg">Select a template:</span>
              <span className="text-chaos-term-dim">›</span>
              {selectedTemplate ? (
                <span className={cn("font-bold", colorClass(selectedTemplate))}>
                  {selectedTemplate.title}
                </span>
              ) : (
                <span className="text-chaos-term-dim">
                  - Pick a template below.
                </span>
              )}
            </div>

            {/* Catalog */}
            <div className="mt-1 min-w-[560px]">
              {visible.map((t, i) => {
                const isCursor = i === activeIndex;
                return (
                  <div key={t.id}>
                    <button
                      type="button"
                      data-index={i}
                      onClick={() => setTemplateId(t.id)}
                      onMouseEnter={() => setCursor(i)}
                      aria-pressed={t.id === templateId}
                      className={cn(
                        "-mx-2 flex w-[calc(100%+16px)] items-baseline gap-0 rounded-lg border-0 bg-transparent px-2 py-0 text-left font-mono text-[13.5px] leading-[1.95] text-inherit transition-colors",
                        isCursor && "bg-[rgba(108,207,224,0.07)]",
                      )}
                    >
                      <span className="inline-block w-[4ch] whitespace-pre text-chaos-term-cursor">
                        {isCursor ? "❯" : ""}
                      </span>
                      <span
                        className={cn(
                          "font-bold",
                          colorClass(t),
                          isCursor && "underline underline-offset-[3px]",
                        )}
                      >
                        {t.title}
                      </span>
                    </button>
                    <div
                      className={cn(
                        "mb-0.5 ml-[4ch] max-w-[88ch] animate-fade-in text-chaos-term-dim",
                        isCursor ? "block" : "hidden",
                      )}
                    >
                      <span className="text-[#96a0b5]">{choiceMeta(t)} · </span>
                      {t.description}
                    </div>
                  </div>
                );
              })}
              {visible.length === 0 && (
                <p className="mt-1 animate-fade-in text-[#e5c07b]">
                  - No templates match &quot;{filter.trim()}&quot;.
                </p>
              )}
            </div>

            <p className="mt-1 text-chaos-term-dim">
              - Hover or use ↑/↓ to browse. Click or press Enter to submit.
            </p>
          </div>
        </Card>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-chaos-line bg-[rgba(10,13,19,0.88)] backdrop-blur-md">
        <div className="mx-auto flex max-w-[1060px] items-center gap-4 px-6 py-3.5">
          <div className="flex min-w-0 flex-1 items-center gap-2.5 overflow-x-auto rounded-xl border border-chaos-line bg-chaos-panel-raised px-4 py-3">
            <span
              className="select-none font-mono text-chaos-accent"
              style={{ textShadow: "0 0 14px rgba(241,83,53,0.45)" }}
            >
              $
            </span>
            <code
              ref={commandRef}
              className="whitespace-nowrap font-mono text-[13.5px] text-[#eef1f6]"
            >
              {command || " "}
            </code>
          </div>
          <Button
            type="button"
            onClick={handleCopy}
            disabled={!command}
            className={cn(
              "shrink-0 rounded-xl border border-[rgba(241,83,53,0.5)] bg-gradient-to-b from-[#ff6a4a] to-[#e8481f] px-5 py-3 text-sm font-semibold text-white shadow-glow-accent transition-transform hover:-translate-y-px",
              copied &&
                "border-[rgba(88,214,141,0.6)] bg-gradient-to-b from-[#47c77a] to-[#2ea25e] shadow-[0_6px_22px_rgba(88,214,141,0.22)]",
            )}
          >
            {copied ? (
              <>
                <Check className="size-4" /> 已复制
              </>
            ) : (
              <>
                <Copy className="size-4" /> 复制命令
              </>
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
}
