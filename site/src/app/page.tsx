"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

import { CHAOS_TEMPLATES } from "@/data/templates";
import { getTemplateDetail } from "@/data/template-details";
import { useLocale } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
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
import { Card } from "@/components/ui/card";
import { PromptInput } from "@/components/prompt-input";
import { SettingsToggles } from "@/components/settings-toggles";
import { TemplateInspector } from "@/components/template-inspector";

// Every catalog row is exactly this tall, and the sliding pointer highlight is
// positioned with `translateY(index * ROW_HEIGHT)`. A fixed row height is what
// lets the pointer move without any row measuring or reflowing, and it also
// makes `scrollTop` a multiple of the row height for keyboard scrolling.
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
  const { t, templateTitle, templateDescription } = useLocale();
  const [pm, setPm] = useState<Pm>("pnpm");
  const [dir, setDir] = useState("my-app");
  const [filter, setFilter] = useState("");
  const [templateId, setTemplateId] = useState<string | null>(
    templates[0]?.id ?? null,
  );
  const [cursor, setCursor] = useState(0);
  const [copied, setCopied] = useState(false);

  const commandRef = useRef<HTMLElement>(null);
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

  // Keyboard browsing walks the pointer through a list that is now its own
  // scroll region: move only that region, and only when the row it targets is
  // actually out of view. The page itself never scrolls.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const scroller = listRef.current;
    if (!scroller) return;

    const top = activeIndex * ROW_HEIGHT;
    const bottom = top + ROW_HEIGHT;
    const viewTop = scroller.scrollTop;
    const viewBottom = viewTop + scroller.clientHeight;

    if (top < viewTop) {
      scroller.scrollTo({ top, behavior: "smooth" });
    } else if (bottom > viewBottom) {
      scroller.scrollTo({
        top: bottom - scroller.clientHeight,
        behavior: "smooth",
      });
    }
  }, [activeIndex]);

  // Committing a template is announced by the prompt flipping to a green ✔, the
  // title taking its kolorist colour and the command bar flashing — all of them
  // colour-only. No outline, no scale: a ring around the prompt read as a border
  // and the zoom made the row look like it was jittering.
  const selectTemplate = useCallback((id: string) => {
    setTemplateId(id);
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
              PM_ORDER[
                (PM_ORDER.indexOf(p) + PM_ORDER.length - 1) % PM_ORDER.length
              ],
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
    <div className="flex h-dvh flex-col overflow-hidden">
      <header className="relative z-20 shrink-0 border-b border-chaos-line bg-chaos-chrome backdrop-blur-md">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-baseline gap-x-4 gap-y-1 px-4 py-3 sm:px-6 sm:py-3.5">
          <a
            href="./"
            className="font-mono text-lg font-bold text-chaos-term-fg no-underline"
          >
            <span
              className="text-chaos-accent"
              style={{ textShadow: "0 0 18px var(--chaos-accent-glow)" }}
            >
              chaos
            </span>
            <span className="font-normal text-chaos-term-dim"> / design</span>
          </a>
          <p className="m-0 hidden flex-1 text-chaos-term-dim sm:block">
            {t.tagline}
          </p>
          <a
            href="https://github.com/chaos-design/chaos/blob/main/docs/templates.md"
            target="_blank"
            rel="noreferrer"
            className="border-b border-chaos-line-strong pb-px text-chaos-term-fg no-underline transition-colors hover:border-chaos-accent hover:text-chaos-accent-dark"
          >
            {t.docsLink}
          </a>
          <div className="ml-auto">
            <SettingsToggles />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1180px] min-h-0 flex-1 px-4 pt-4 pb-3 sm:px-6 sm:pt-5 sm:pb-4">
        <Card className="animate-rise flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border-chaos-line bg-chaos-term-bg shadow-terminal">
          <div className="relative z-10 flex shrink-0 items-center gap-2 border-b border-chaos-line bg-chaos-term-chrome px-4 py-2.5">
            <span
              className="h-2.5 w-2.5 rounded-full bg-chaos-accent"
              style={{ boxShadow: "0 0 10px var(--chaos-accent-glow)" }}
            />
            <span className="h-2.5 w-2.5 rounded-full bg-chaos-warn" />
            <span className="h-2.5 w-2.5 rounded-full bg-chaos-success" />
            <span className="ml-2 font-mono text-xs text-chaos-term-dim">
              create-chaos — {t.chromeTitle}
            </span>
            <div className="ml-auto flex items-center gap-3 font-mono text-[11px] text-chaos-term-dim">
              <span className="hidden sm:inline">
                {t.templatesWord}{" "}
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

          <div className="relative flex min-h-0 flex-1 flex-col">
            {/* Sci-fi ambience: one sweeping scanline, transform-only, sitting
                above the backdrop but below the content. */}
            <span
              aria-hidden
              className="animate-scan pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(to_bottom,transparent,var(--chaos-scanline),transparent)]"
            />

            <div className="relative z-10 grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] gap-3 px-4 py-3 sm:gap-4 sm:px-5 sm:py-4 lg:grid-cols-[minmax(0,1fr)_21.5rem] lg:grid-rows-[minmax(0,1fr)]">
              <div className="flex min-h-0 min-w-0 flex-col font-mono text-[13.5px] leading-[1.9]">
                {/* The prompt block keeps its natural height; the catalog below
                    takes whatever is left and scrolls on its own. */}
                <div className="shrink-0">
                  {/* Filter */}
                  <div className="group flex flex-wrap items-baseline gap-2">
                    <span className="font-bold text-kolorist-magenta">?</span>
                    <label
                      htmlFor="filter-input"
                      className="font-bold text-chaos-term-fg"
                    >
                      {t.filterLabel}
                    </label>
                    <span className="text-chaos-term-dim transition-colors group-focus-within:text-chaos-term-cursor">
                      ›
                    </span>
                    <PromptInput
                      id="filter-input"
                      ref={filterRef}
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      placeholder="(all)"
                      spellCheck={false}
                      autoComplete="off"
                      aria-describedby="filter-hint"
                      minCells={5}
                      maxCells={28}
                    />
                    <span
                      id="filter-hint"
                      className="hidden text-[11.5px] text-chaos-term-dim sm:inline"
                    >
                      {filtered ? t.filterMatch(visible.length) : t.filterAllHint}
                    </span>
                  </div>

                  {/* Project name */}
                  <div className="group flex flex-wrap items-baseline gap-2">
                    <span className="font-bold text-kolorist-magenta">?</span>
                    <label
                      htmlFor="dir-input"
                      className="font-bold text-chaos-term-fg"
                    >
                      {t.dirLabel}
                    </label>
                    <span className="text-chaos-term-dim transition-colors group-focus-within:text-chaos-term-cursor">
                      ›
                    </span>
                    <PromptInput
                      id="dir-input"
                      value={dir}
                      onChange={(e) => setDir(e.target.value)}
                      placeholder="chaos-project"
                      spellCheck={false}
                      autoComplete="off"
                      minCells={6}
                      maxCells={40}
                    />
                    <span className="hidden text-[11.5px] text-chaos-term-dim sm:inline">
                      {t.dirHint}
                    </span>
                  </div>

                  {/* Package manager */}
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-bold text-kolorist-magenta">?</span>
                    <span className="font-bold text-chaos-term-fg">
                      {t.pmLabel}
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
                            "cursor-pointer border-0 bg-transparent p-0 font-mono text-chaos-term-dim transition-colors hover:text-chaos-hover-fg",
                            pm === p &&
                              "text-chaos-term-cursor underline underline-offset-[3px]",
                          )}
                          style={
                            pm === p
                              ? { textShadow: "0 0 14px var(--chaos-cursor-glow)" }
                              : undefined
                          }
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                    <span className="hidden text-[11.5px] text-chaos-term-dim sm:inline">
                      ←/→
                    </span>
                  </div>

                  {/* Submitted template */}
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span
                      className={cn(
                        "font-bold",
                        selectedTemplate
                          ? "text-chaos-success"
                          : "text-kolorist-magenta",
                      )}
                    >
                      {selectedTemplate ? "✔" : "?"}
                    </span>
                    <span className="font-bold text-chaos-term-fg">
                      {t.selectLabel}
                    </span>
                    <span className="text-chaos-term-dim">›</span>
                    {selectedTemplate ? (
                      // `truncate` keeps the value on the label's line, so the
                      // prompt block is exactly one line tall for every
                      // template: committing one can never push the catalog
                      // down by a wrapped line.
                      <span
                        className={cn(
                          "min-w-0 truncate font-bold",
                          colorClass(selectedTemplate),
                        )}
                      >
                        {templateTitle(selectedTemplate)}
                      </span>
                    ) : (
                      <span className="min-w-0 truncate text-chaos-term-dim">
                        {t.selectEmpty}
                      </span>
                    )}
                  </div>
                </div>

                {/*
                 * Catalog. Its own scroll region: rows are a fixed height and
                 * carry no inline description, and the pointer is one
                 * absolutely positioned bar that slides with a transform, so
                 * moving it never reflows anything.
                 */}
                <div
                  ref={listRef}
                  className="chaos-scroll relative mt-1.5 min-h-0 flex-1 overflow-y-auto"
                >
                  {visible.length > 0 && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 top-0 rounded-md border-l-2 border-chaos-term-cursor bg-chaos-cursor-bg transition-transform duration-200 ease-out will-change-transform motion-reduce:transition-none"
                      style={{
                        height: ROW_HEIGHT,
                        transform: `translateY(${activeIndex * ROW_HEIGHT}px)`,
                      }}
                    />
                  )}

                  {visible.map((tpl, i) => {
                    const isCursor = i === activeIndex;
                    const isChosen = tpl.id === templateId;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        data-index={i}
                        onClick={() => selectTemplate(tpl.id)}
                        onMouseEnter={() => setCursor(i)}
                        onFocus={() => setCursor(i)}
                        aria-pressed={isChosen}
                        title={`${templateTitle(tpl)} — ${choiceMeta(tpl)}`}
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
                        <span className="flex min-w-0 items-baseline gap-2">
                          <span
                            className={cn(
                              "truncate font-bold transition-[filter] duration-200",
                              colorClass(tpl),
                              isCursor &&
                                "underline underline-offset-[3px] [filter:brightness(1.18)_drop-shadow(0_0_10px_rgba(108,207,224,0.25))]",
                            )}
                          >
                            {templateTitle(tpl)}
                          </span>
                          {tpl.alias !== tpl.id ? (
                            <span className="hidden shrink-0 text-[11.5px] text-chaos-term-dim sm:inline">
                              {tpl.alias}
                            </span>
                          ) : null}
                        </span>
                        <span className="ml-auto hidden w-[5.5rem] shrink-0 truncate text-right text-[11px] text-chaos-term-dim-70 md:inline">
                          {tpl.categoryLabel}
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
                    <p className="mt-1 animate-fade-in text-chaos-warn">
                      {t.noMatch(filter.trim())}
                    </p>
                  )}
                </div>

                <p className="hidden shrink-0 pt-1.5 text-[11.5px] text-chaos-term-dim sm:block">
                  {t.keysHint}
                </p>
              </div>

              <TemplateInspector
                template={activeTemplate}
                detail={activeDetail}
                isSelected={!!activeTemplate && activeTemplate.id === templateId}
                pm={pm}
                dir={dir}
                onSubmit={submitActive}
                className="h-[9.5rem] lg:h-auto"
              />
            </div>
          </div>
        </Card>
      </main>

      <footer className="relative z-20 shrink-0 border-t border-chaos-line bg-chaos-chrome-strong backdrop-blur-md">
        <div className="mx-auto flex max-w-[1180px] items-center gap-3 px-4 py-2.5 sm:gap-4 sm:px-6 sm:py-3">
          <div className="flex min-w-0 flex-1 items-center gap-2.5 overflow-x-auto rounded-xl border border-chaos-line bg-chaos-panel-raised px-4 py-2.5">
            <span
              className="select-none font-mono text-chaos-accent"
              style={{ textShadow: "0 0 14px var(--chaos-accent-glow)" }}
            >
              $
            </span>
            <code
              ref={commandRef}
              className="whitespace-nowrap font-mono text-[13.5px] text-chaos-command-fg"
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
              "shrink-0 rounded-xl border border-chaos-copy-border bg-gradient-to-b from-chaos-copy-a to-chaos-copy-b px-5 py-2.5 text-sm font-semibold text-white shadow-glow-accent transition-transform hover:-translate-y-px",
              copied &&
                "border-chaos-copy-ok-border bg-gradient-to-b from-chaos-copy-ok-a to-chaos-copy-ok-b shadow-[0_6px_22px_var(--chaos-success-glow)]",
            )}
          >
            {copied ? (
              <>
                <Check className="size-4" /> {t.copied}
              </>
            ) : (
              <>
                <Copy className="size-4" /> {t.copyBtn}
              </>
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
}
