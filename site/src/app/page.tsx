"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

import { CHAOS_TEMPLATES } from "@/data/templates";
import { getTemplateDetail } from "@/data/template-details";
import { cn } from "@/lib/utils";
import {
  buildCommand,
  choiceMeta,
  colorClass,
  matchesFilter,
  PM_ORDER,
  type Pm,
} from "@/lib/template-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { TemplateInspector } from "@/components/template-inspector";

// Every catalog row is exactly this tall, and the sliding pointer highlight is
// positioned with `translateY(index * ROW_HEIGHT)`. A fixed row height is what
// lets the pointer move without any row measuring or reflowing.
const ROW_HEIGHT = 30;

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
  const promptRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLInputElement>(null);
  const firstRender = useRef(true);

  const visible = useMemo(
    () => templates.filter((t) => matchesFilter(t, filter.trim().toLowerCase())),
    [templates, filter],
  );

  const activeIndex = Math.min(cursor, Math.max(0, visible.length - 1));
  const activeTemplate = visible[activeIndex] ?? null;
  const activeDetail = activeTemplate ? getTemplateDetail(activeTemplate) : null;
  const selectedTemplate = templates.find((t) => t.id === templateId) ?? null;
  const command = selectedTemplate
    ? buildCommand(pm, dir, selectedTemplate.alias)
    : "";
  const filtered = filter.trim().length > 0;

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

  // Keyboard browsing can walk the pointer off-screen; nudge the page only when
  // the highlighted row actually leaves the viewport, so nothing moves while it
  // is already visible.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`,
    );
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const margin = 140;
    if (rect.top < margin || rect.bottom > window.innerHeight - margin) {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [activeIndex]);

  const selectTemplate = useCallback((id: string) => {
    setTemplateId(id);
    const el = promptRef.current;
    if (el) {
      el.classList.remove("animate-prompt-pop");
      void el.offsetWidth;
      el.classList.add("animate-prompt-pop");
    }
  }, []);

  const submitActive = useCallback(() => {
    const t = visible[activeIndex];
    if (t) selectTemplate(t.id);
  }, [visible, activeIndex, selectTemplate]);

  const handleCopy = useCallback(async () => {
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
  }, [command]);

  // Keyboard map, modelled on a fzf-style picker: browse, jump, switch the
  // package manager, commit — all without leaving home row. Keys are ignored
  // while an input has focus so text editing keeps them.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.target instanceof HTMLInputElement) {
        if (e.key === "Escape") {
          e.target.blur();
        }
        return;
      }

      const move = (delta: number) => {
        setCursor((c) => {
          const max = Math.max(0, visible.length - 1);
          if (max === 0) return 0;
          const next = c + delta;
          if (next < 0) return max;
          if (next > max) return 0;
          return next;
        });
      };

      switch (e.key) {
        case "ArrowDown":
        case "j":
          e.preventDefault();
          move(1);
          break;
        case "ArrowUp":
        case "k":
          e.preventDefault();
          move(-1);
          break;
        case "Home":
          e.preventDefault();
          setCursor(0);
          break;
        case "End":
          e.preventDefault();
          setCursor(Math.max(0, visible.length - 1));
          break;
        case "ArrowRight":
          e.preventDefault();
          setPm((p) => PM_ORDER[(PM_ORDER.indexOf(p) + 1) % PM_ORDER.length]);
          break;
        case "ArrowLeft":
          e.preventDefault();
          setPm(
            (p) =>
              PM_ORDER[(PM_ORDER.indexOf(p) + PM_ORDER.length - 1) % PM_ORDER.length],
          );
          break;
        case "Enter":
          e.preventDefault();
          submitActive();
          break;
        case "/":
          e.preventDefault();
          filterRef.current?.focus();
          filterRef.current?.select();
          break;
        case "Escape":
          e.preventDefault();
          if (filter) setFilter("");
          break;
        case "c":
          e.preventDefault();
          void handleCopy();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, submitActive, filter, handleCopy]);

  const countLabel =
    visible.length === 0
      ? "--/--"
      : `${String(activeIndex + 1).padStart(2, "0")}/${String(
          visible.length,
        ).padStart(2, "0")}`;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-chaos-line bg-[rgba(10,13,19,0.82)] backdrop-blur-md">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-baseline gap-4 px-6 py-5">
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

      <main className="mx-auto max-w-[1180px] px-6">
        <Card className="animate-rise relative mt-10 mb-8 overflow-hidden rounded-2xl border-chaos-line bg-chaos-term-bg shadow-terminal">
          <div className="relative z-10 flex items-center gap-2 border-b border-chaos-line bg-chaos-term-chrome px-4 py-3">
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
            <div className="ml-auto flex items-center gap-3 font-mono text-[11px] text-chaos-term-dim">
              <span className="hidden sm:inline">
                templates{" "}
                <b className="inline-block min-w-[2ch] text-right font-normal tabular-nums text-chaos-term-fg">
                  {visible.length}
                </b>
                /{templates.length}
              </span>
              <span className="hidden md:inline">
                pm <b className="font-normal text-chaos-term-cursor">{pm}</b>
              </span>
              <span className="tabular-nums">{countLabel}</span>
            </div>
          </div>

          <div className="relative">
            {/* Sci-fi ambience: one sweeping scanline, transform-only, sitting
                above the backdrop but below the content. */}
            <span
              aria-hidden
              className="animate-scan pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(to_bottom,transparent,rgba(108,207,224,0.05),transparent)]"
            />

            <div className="relative z-10 grid gap-5 px-5 py-5 lg:grid-cols-[minmax(0,1fr)_21.5rem]">
              <div className="min-w-0 overflow-x-auto font-mono text-[13.5px] leading-[1.95]">
                <div className="min-w-[34rem] px-2">
                  {/* Filter */}
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-bold text-[#c678dd]">?</span>
                    <label
                      htmlFor="filter-input"
                      className="font-bold text-chaos-term-fg"
                    >
                      Filter templates:
                    </label>
                    <span className="text-chaos-term-dim">›</span>
                    <Input
                      id="filter-input"
                      ref={filterRef}
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      placeholder="(all)"
                      spellCheck={false}
                      autoComplete="off"
                      className="h-auto w-[18ch] min-w-[8ch] border-0 bg-transparent p-0 font-mono text-chaos-term-fg caret-[#6ccfe0] focus-visible:ring-0"
                    />
                    <span className="text-chaos-term-dim">
                      {filtered
                        ? `- ${visible.length} match${
                            visible.length === 1 ? "" : "es"
                          }, Esc to clear.`
                        : "- Leave empty to list all."}
                    </span>
                  </div>

                  {/* Project name */}
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-bold text-[#c678dd]">?</span>
                    <label
                      htmlFor="dir-input"
                      className="font-bold text-chaos-term-fg"
                    >
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
                    <span className="text-chaos-term-dim">
                      - Blank falls back to chaos-project.
                    </span>
                  </div>

                  {/* Package manager */}
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-bold text-[#c678dd]">?</span>
                    <span className="font-bold text-chaos-term-fg">
                      Package manager:
                    </span>
                    <span className="text-chaos-term-dim">›</span>
                    <div className="inline-flex gap-4" role="group">
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
                              ? {
                                  textShadow:
                                    "0 0 14px rgba(108,207,224,0.35)",
                                }
                              : undefined
                          }
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                    <span className="text-chaos-term-dim">
                      - ←/→ to switch.
                    </span>
                  </div>

                  {/* Submitted template */}
                  <div
                    ref={promptRef}
                    className="flex origin-left flex-wrap items-baseline gap-2 rounded-md"
                  >
                    <span
                      className={cn(
                        "font-bold",
                        selectedTemplate ? "text-chaos-success" : "text-[#c678dd]",
                      )}
                    >
                      {selectedTemplate ? "✔" : "?"}
                    </span>
                    <span className="font-bold text-chaos-term-fg">
                      Select a template:
                    </span>
                    <span className="text-chaos-term-dim">›</span>
                    {selectedTemplate ? (
                      <span
                        className={cn(
                          "font-bold",
                          colorClass(selectedTemplate),
                        )}
                      >
                        {selectedTemplate.title}
                      </span>
                    ) : (
                      <span className="text-chaos-term-dim">
                        - Pick a template below.
                      </span>
                    )}
                  </div>

                  {/*
                   * Catalog. Rows are a fixed height and carry no inline
                   * description: the pointer is drawn by one absolutely
                   * positioned bar that slides with a transform, so moving it
                   * never reflows the list. Details live in the panel beside.
                   */}
                  <div ref={listRef} className="relative mt-1">
                    {visible.length > 0 && (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 top-0 rounded-md border-l-2 border-chaos-term-cursor bg-[rgba(108,207,224,0.07)] transition-transform duration-200 ease-out will-change-transform motion-reduce:transition-none"
                        style={{
                          height: ROW_HEIGHT,
                          transform: `translateY(${activeIndex * ROW_HEIGHT}px)`,
                        }}
                      />
                    )}

                    {visible.map((t, i) => {
                      const isCursor = i === activeIndex;
                      const isChosen = t.id === templateId;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          data-index={i}
                          onClick={() => selectTemplate(t.id)}
                          onMouseEnter={() => setCursor(i)}
                          onFocus={() => setCursor(i)}
                          aria-pressed={isChosen}
                          title={`${t.title} — ${choiceMeta(t)}`}
                          className="relative flex w-full items-center gap-2 rounded-md px-2 text-left font-mono text-[13.5px] text-inherit"
                          style={{ height: ROW_HEIGHT }}
                        >
                          <span
                            className="inline-block w-[2ch] shrink-0 text-chaos-term-cursor transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none"
                            style={{
                              opacity: isCursor ? 1 : 0,
                              transform: isCursor
                                ? "translateX(0)"
                                : "translateX(-4px)",
                            }}
                          >
                            ❯
                          </span>
                          <span
                            className={cn(
                              "shrink-0 font-bold transition-[filter] duration-200",
                              colorClass(t),
                              isCursor &&
                                "underline underline-offset-[3px] [filter:brightness(1.18)_drop-shadow(0_0_10px_rgba(108,207,224,0.25))]",
                            )}
                          >
                            {t.title}
                          </span>
                          <span className="min-w-0 truncate text-[11.5px] text-chaos-term-dim/80">
                            {t.alias !== t.id ? t.alias : ""}
                          </span>
                          <span className="ml-auto w-[5.5rem] shrink-0 truncate text-right text-[11px] text-chaos-term-dim/70">
                            {t.categoryLabel}
                          </span>
                          <span
                            className="w-[1.5ch] shrink-0 text-right text-chaos-success transition-opacity duration-150"
                            style={{ opacity: isChosen ? 1 : 0 }}
                          >
                            ✔
                          </span>
                        </button>
                      );
                    })}

                    {visible.length === 0 && (
                      <p className="mt-1 animate-fade-in text-[#e5c07b]">
                        - No templates match &quot;{filter.trim()}&quot;.
                      </p>
                    )}
                  </div>

                  <p className="mt-2 text-[12px] text-chaos-term-dim">
                    - ↑/↓ or j/k browse · Enter choose · / filter · c copy ·
                    ←/→ package manager.
                  </p>
                </div>
              </div>

              <TemplateInspector
                template={activeTemplate}
                detail={activeDetail}
                isSelected={
                  !!activeTemplate && activeTemplate.id === templateId
                }
                pm={pm}
                dir={dir}
                onSubmit={submitActive}
              />
            </div>
          </div>
        </Card>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-chaos-line bg-[rgba(10,13,19,0.88)] backdrop-blur-md">
        <div className="mx-auto flex max-w-[1180px] items-center gap-4 px-6 py-3.5">
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
            <span
              aria-hidden
              className="animate-caret-blink inline-block h-[1.05em] w-[0.55ch] shrink-0 bg-chaos-term-cursor align-middle"
            />
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
