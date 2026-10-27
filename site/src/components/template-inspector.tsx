"use client";

import { CornerDownLeft, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n";
import type { ChaosTemplate, TemplateDetail } from "@/lib/types";
import { buildCommand, colorClass, type Pm } from "@/lib/template-ui";
import { cn } from "@/lib/utils";

interface TemplateInspectorProps {
  /** Template the `❯` pointer currently sits on. */
  template: ChaosTemplate | null;
  detail: TemplateDetail | null;
  /** Whether the pointer template is the one already submitted. */
  isSelected: boolean;
  pm: Pm;
  dir: string;
  onSubmit: () => void;
  /** Height comes from the caller: it stretches with the grid on wide screens. */
  className?: string;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.2em] text-chaos-term-dim">
      {children}
    </h3>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2 font-mono text-[12.5px]">
      <span className="w-[5.5rem] shrink-0 text-chaos-term-dim">{label}</span>
      <span className="min-w-0 break-all text-chaos-meta-fg">{value}</span>
    </div>
  );
}

/**
 * A fixed-height companion panel for the catalog. It is a sibling of the list,
 * not an inline expansion of it, so browsing templates never reflows the page —
 * the height is constant and richer copy simply scrolls inside.
 */
export function TemplateInspector({
  template,
  detail,
  isSelected,
  pm,
  dir,
  onSubmit,
  className,
}: TemplateInspectorProps) {
  const { t, locale, templateTitle, templateDescription } = useLocale();

  // Chinese variants of the inspector copy, falling back to the English
  // source of truth when a translation is not provided.
  const nextCopy =
    locale === "zh"
      ? detail?.nextZh ?? detail?.next
      : detail?.next;
  const requiresCopy =
    locale === "zh"
      ? detail?.requiresZh ?? detail?.requires
      : detail?.requires;

  return (
    <aside
      aria-live="polite"
      className={cn(
        "relative flex min-h-0 flex-col overflow-hidden rounded-xl border border-chaos-line bg-chaos-inspector-bg",
        className,
      )}
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-chaos-line px-4 py-2.5">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-chaos-term-dim">
          {t.inspectorTitle}
        </span>
        <span
          className={cn(
            "ml-auto font-mono text-[11px] transition-colors",
            isSelected ? "text-chaos-success" : "text-chaos-term-dim",
          )}
        >
          {isSelected ? `● ${t.selectedMark}` : `○ ${t.browsingMark}`}
        </span>
      </div>

      {template ? (
        <div
          // Re-keyed on the pointer so the copy animates in as the highlight
          // moves. Opacity + transform only: the swap cannot shift anything.
          key={template.id}
          className="chaos-scroll animate-panel-in flex-1 space-y-4 overflow-y-auto px-4 py-3.5"
        >
          <div>
            <h2
              className={cn(
                "font-mono text-[15px] font-bold leading-snug",
                colorClass(template),
              )}
            >
              {templateTitle(template)}
            </h2>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-chaos-desc-fg">
              {templateDescription(template)}
            </p>
          </div>

          {detail?.stack.length ? (
            <div className="flex flex-wrap gap-1.5">
              {detail.stack.map((chip) => (
                <span
                  key={chip}
                  className="rounded-md border border-chaos-line bg-chaos-chip-bg px-2 py-0.5 font-mono text-[11px] text-chaos-chip-fg"
                >
                  {chip}
                </span>
              ))}
            </div>
          ) : null}

          <div className="space-y-1 border-t border-chaos-line pt-3">
            <MetaRow label={t.metaTemplate} value={template.id} />
            {template.alias !== template.id ? (
              <MetaRow label={t.metaAlias} value={template.alias} />
            ) : null}
            <MetaRow label={t.metaCategory} value={template.categoryLabel} />
            <MetaRow
              label={t.metaSource}
              value={`templates/${template.path}`}
            />
          </div>

          {detail?.includes.length ? (
            <div className="border-t border-chaos-line pt-3">
              <div className="mb-2 flex items-baseline gap-2">
                <SectionLabel>{t.includesLabel}</SectionLabel>
                <span className="ml-auto rounded-md bg-chaos-chip-bg px-1.5 py-0.5 font-mono text-[10.5px] tabular-nums text-chaos-chip-fg">
                  {detail.includes.length} {t.includesUnit}
                </span>
              </div>
              {/*
               * The file manifest as a self-contained, scrollable tree: it
               * grows with its content up to a fixed max height, then scrolls
               * inside instead of letting the whole panel scroll. Each row is
               * a path plus an optional dim annotation split on " — ".
               */}
              <ul
                role="list"
                className="chaos-scroll -mx-1 max-h-48 space-y-0.5 overflow-y-auto rounded-lg border border-chaos-line bg-chaos-file-bg px-1 py-1.5"
              >
                {detail.includes.map((entry) => {
                  // A row is either a bare path, or "path — annotation".
                  const [path, annotation] = entry.split(" — ", 2);
                  return (
                    <li
                      key={entry}
                      className="rounded-md px-2 py-1 transition-colors hover:bg-chaos-hover-bg"
                    >
                      <div className="flex items-baseline gap-1.5">
                        <span className="shrink-0 text-chaos-term-cursor">
                          ▸
                        </span>
                        <code className="min-w-0 break-all font-mono text-[12px] leading-relaxed text-chaos-meta-fg">
                          {path}
                        </code>
                      </div>
                      {annotation ? (
                        <p className="mt-0.5 pl-4 font-mono text-[10.5px] leading-snug text-chaos-term-dim">
                          {annotation}
                        </p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          {requiresCopy ? (
            <div className="flex gap-2 rounded-lg border border-chaos-warn-border bg-chaos-warn-bg px-2.5 py-2">
              <TriangleAlert className="mt-px size-3.5 shrink-0 text-chaos-warn" />
              <p className="font-mono text-[11.5px] leading-relaxed text-chaos-warn-fg">
                {requiresCopy}
              </p>
            </div>
          ) : null}

          {nextCopy ? (
            <div className="border-t border-chaos-line pt-3">
              <SectionLabel>{t.nextLabel}</SectionLabel>
              <p className="font-mono text-[12px] leading-relaxed text-chaos-sub-fg">
                <span className="text-chaos-success">→ </span>
                {nextCopy}
              </p>
            </div>
          ) : null}

          <div className="border-t border-chaos-line pt-3">
            <SectionLabel>{t.commandLabel}</SectionLabel>
            <code className="block break-all rounded-lg border border-chaos-line bg-chaos-code-bg px-2.5 py-2 font-mono text-[11.5px] leading-relaxed text-chaos-code-fg">
              <span className="text-chaos-accent">$ </span>
              {buildCommand(pm, dir, template.alias)}
            </code>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center px-6 text-center">
          <p className="font-mono text-[12.5px] leading-relaxed text-chaos-term-dim">
            {t.emptyPanel}
            <br />
            {t.emptyPanelHint}
          </p>
        </div>
      )}

      <div className="flex shrink-0 items-center gap-3 border-t border-chaos-line px-4 py-2.5">
        {template && isSelected ? (
          <p className="font-mono text-[11.5px] text-chaos-success">
            ✔ {t.pickedNote}
          </p>
        ) : (
          <>
            <Button
              type="button"
              onClick={onSubmit}
              disabled={!template}
              className="h-auto gap-1.5 rounded-lg border border-chaos-pick-border bg-chaos-pick-bg px-3 py-2 font-mono text-[12px] text-chaos-pick-fg shadow-none transition-colors hover:bg-chaos-pick-bg-hover"
            >
              <CornerDownLeft className="size-3.5" />
              {t.pickBtn}
            </Button>
            <span className="font-mono text-[11px] text-chaos-term-dim">
              Enter
            </span>
          </>
        )}
      </div>
    </aside>
  );
}
