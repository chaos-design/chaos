"use client";

import { CornerDownLeft, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
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
      <span className="min-w-0 break-all text-[#c8d0de]">{value}</span>
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
}: TemplateInspectorProps) {
  return (
    <aside
      aria-live="polite"
      className="relative flex h-[26rem] flex-col overflow-hidden rounded-xl border border-chaos-line bg-[rgba(13,17,24,0.72)]"
    >
      <div className="flex items-center gap-2 border-b border-chaos-line px-4 py-2.5">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-chaos-term-dim">
          inspector
        </span>
        <span
          className={cn(
            "ml-auto font-mono text-[11px] transition-colors",
            isSelected ? "text-chaos-success" : "text-chaos-term-dim",
          )}
        >
          {isSelected ? "● selected" : "○ browsing"}
        </span>
      </div>

      {template ? (
        <div
          // Re-keyed on the pointer so the copy animates in as the highlight
          // moves. Opacity + transform only: the swap cannot shift anything.
          key={template.id}
          className="animate-panel-in flex-1 space-y-4 overflow-y-auto px-4 py-3.5"
        >
          <div>
            <h2
              className={cn(
                "font-mono text-[15px] font-bold leading-snug",
                colorClass(template),
              )}
            >
              {template.title}
            </h2>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#a7b0c2]">
              {template.description}
            </p>
          </div>

          {detail?.stack.length ? (
            <div className="flex flex-wrap gap-1.5">
              {detail.stack.map((chip) => (
                <span
                  key={chip}
                  className="rounded-md border border-chaos-line bg-[rgba(108,207,224,0.06)] px-2 py-0.5 font-mono text-[11px] text-[#9fd8e4]"
                >
                  {chip}
                </span>
              ))}
            </div>
          ) : null}

          <div className="space-y-1 border-t border-chaos-line pt-3">
            <MetaRow label="template" value={template.id} />
            {template.alias !== template.id ? (
              <MetaRow label="alias" value={template.alias} />
            ) : null}
            <MetaRow label="category" value={template.categoryLabel} />
            <MetaRow
              label="source"
              value={`templates/${template.path}`}
            />
          </div>

          {detail?.includes.length ? (
            <div className="border-t border-chaos-line pt-3">
              <SectionLabel>Includes</SectionLabel>
              <ul className="space-y-1">
                {detail.includes.map((entry) => (
                  <li
                    key={entry}
                    className="flex gap-2 font-mono text-[12px] leading-relaxed text-[#b5bdcc]"
                  >
                    <span className="text-chaos-term-cursor">▸</span>
                    <span className="min-w-0 break-words">{entry}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {detail?.requires ? (
            <div className="flex gap-2 rounded-lg border border-[rgba(229,192,123,0.28)] bg-[rgba(229,192,123,0.06)] px-2.5 py-2">
              <TriangleAlert className="mt-px size-3.5 shrink-0 text-[#e5c07b]" />
              <p className="font-mono text-[11.5px] leading-relaxed text-[#e3cfa6]">
                {detail.requires}
              </p>
            </div>
          ) : null}

          {detail?.next ? (
            <div className="border-t border-chaos-line pt-3">
              <SectionLabel>Next</SectionLabel>
              <p className="font-mono text-[12px] leading-relaxed text-[#b5bdcc]">
                <span className="text-chaos-success">→ </span>
                {detail.next}
              </p>
            </div>
          ) : null}

          <div className="border-t border-chaos-line pt-3">
            <SectionLabel>Command</SectionLabel>
            <code className="block break-all rounded-lg border border-chaos-line bg-[rgba(7,9,14,0.7)] px-2.5 py-2 font-mono text-[11.5px] leading-relaxed text-[#dfe4ee]">
              <span className="text-chaos-accent">$ </span>
              {buildCommand(pm, dir, template.alias)}
            </code>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center px-6 text-center">
          <p className="font-mono text-[12.5px] leading-relaxed text-chaos-term-dim">
            没有匹配的模板。
            <br />
            清空 Filter 即可重新浏览。
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 border-t border-chaos-line px-4 py-3">
        {template && isSelected ? (
          <p className="font-mono text-[11.5px] text-chaos-success">
            ✔ 已选用，底部命令已就绪
          </p>
        ) : (
          <>
            <Button
              type="button"
              onClick={onSubmit}
              disabled={!template}
              className="h-auto gap-1.5 rounded-lg border border-[rgba(108,207,224,0.35)] bg-[rgba(108,207,224,0.08)] px-3 py-2 font-mono text-[12px] text-[#cdeef5] shadow-none transition-colors hover:bg-[rgba(108,207,224,0.16)] hover:text-white"
            >
              <CornerDownLeft className="size-3.5" />
              选用此模板
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
