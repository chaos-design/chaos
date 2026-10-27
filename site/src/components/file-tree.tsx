"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronRight, File, Folder, FolderOpen } from "lucide-react";

import { useLocale } from "@/lib/i18n";
import type { FileNode } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * A `tree`-command-style collapsible file manifest.
 *
 * Every row renders real branch glyphs (`├──` / `└──`) plus a vertical guide
 * column (`│  ` / `   `) in a monospaced `pre`, the way the classic `tree`
 * command does. Folders expand/collapse (chevron + open/closed icon); a
 * collapsed folder shows a dim count badge like the VS Code explorer. The
 * root label sits above the rows and a `tree`-style stat line —
 * `<N> directories, <M> files` — closes the view, with the counts tinted in
 * the accent colour exactly like the reference screenshot.
 *
 * All folders open by default so short manifests stay scannable; the tree
 * scrolls inside its max height. Expansion is local state keyed by
 * `<template>:<node-path>` so switching templates re-seeds the defaults.
 */

/** Recount the reachable dirs and files under `items` (excluding the root). */
function tally(
  items: FileNode[],
  acc: { dirs: number; files: number },
): void {
  for (const node of items) {
    if (node.type === "folder") {
      acc.dirs += 1;
      if (node.children?.length) tally(node.children, acc);
    } else {
      acc.files += 1;
    }
  }
}

/**
 * Indent guides + branch connector for a row at `depth` (root is depth 0).
 * `trails[i]` says whether the ancestor at depth `i + 1` was the last child —
 * that decides a `│` guide (a sibling still hangs below it) vs blank space.
 */
function rowCells(isLast: boolean, depth: number, trails: boolean[]): string {
  let prefix = "";
  for (let d = 0; d < depth - 1; d += 1) {
    prefix += trails[d] ? "   " : "│  ";
  }
  return prefix + (isLast ? "└── " : "├── ");
}

export function FileTree({
  nodes,
  root,
}: {
  nodes: FileNode[];
  /** Template id — resets the open-folder set when it changes. */
  root: string;
}) {
  const { t } = useLocale();

  // Default: every folder (at any depth) starts open.
  const openKeys = (template: string, items: FileNode[]) => {
    const keys = new Set<string>();
    const walk = (nodes: FileNode[], prefix: string) => {
      for (const node of nodes) {
        if (node.type === "folder") {
          const path = prefix ? `${prefix}/${node.name}` : node.name;
          if (node.children?.length) keys.add(`${template}:${path}`);
          if (node.children?.length) walk(node.children, path);
        }
      }
    };
    walk(items, "");
    return keys;
  };

  const [open, setOpen] = useState<Set<string>>(() => openKeys(root, nodes));

  // Re-seed when the pointed-at template changes.
  const [seed, setSeed] = useState(root);
  useEffect(() => {
    if (seed !== root) {
      setSeed(root);
      setOpen(openKeys(root, nodes));
    }
    // nodes come from the same data source as root; re-seeding on root is enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root]);

  const { dirs, files } = useMemo(() => {
    const acc = { dirs: 0, files: 0 };
    tally(nodes, acc);
    return acc;
  }, [nodes]);

  const keyOf = (path: string) => `${root}:${path}`;

  const toggle = (path: string) => {
    const key = keyOf(path);
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const renderRows = (
    items: FileNode[],
    pathPrefix: string,
    depth: number,
    trails: boolean[] = [],
  ): React.ReactNode => {
    const cells = items.length;
    return items.map((node, i) => {
      const isLast = i === cells - 1;
      const path = pathPrefix ? `${pathPrefix}/${node.name}` : node.name;
      const key = keyOf(path);
      const isFolder = node.type === "folder";
      const isOpen = isFolder && open.has(key);

      return (
        <div key={key}>
          <button
            type="button"
            aria-expanded={isFolder ? isOpen : undefined}
            disabled={!isFolder}
            onClick={() => isFolder && toggle(path)}
            className={cn(
              "group flex w-full items-center gap-1 rounded py-0.5 pr-1.5 text-left",
              isFolder &&
                "cursor-pointer pl-1 transition-colors hover:bg-chaos-hover-bg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-chaos-term-cursor",
            )}
          >
            <pre
              aria-hidden
              className="shrink-0 select-none leading-[1.7] text-chaos-term-dim-soft"
            >
              {rowCells(isLast, depth, trails)}
            </pre>
            {isFolder ? (
              <>
                <ChevronRight
                  aria-hidden
                  className={cn(
                    "size-3 shrink-0 text-chaos-term-dim transition-transform duration-150",
                    isOpen && "rotate-90 text-chaos-term-cursor",
                  )}
                />
                {isOpen ? (
                  <FolderOpen
                    aria-hidden
                    className="size-3.5 shrink-0 text-chaos-term-cursor"
                  />
                ) : (
                  <Folder
                    aria-hidden
                    className="size-3.5 shrink-0 text-chaos-warn"
                  />
                )}
                <span className="truncate font-medium text-chaos-meta-fg">
                  {node.name}
                </span>
                {!isOpen && node.count != null ? (
                  <span className="ml-auto shrink-0 rounded bg-chaos-chip-bg px-1 text-[10px] tabular-nums text-chaos-chip-fg">
                    {node.count}
                  </span>
                ) : null}
              </>
            ) : (
              <>
                <File aria-hidden className="size-3.5 shrink-0 text-chaos-term-dim" />
                <span className="min-w-0 truncate text-chaos-meta-fg">
                  {node.name}
                </span>
              </>
            )}
          </button>

          {isOpen && node.children?.length ? (
            renderRows(node.children, path, depth + 1, [...trails, isLast])
          ) : null}
        </div>
      );
    });
  };

  return (
    <div className="chaos-scroll font-mono text-[11.5px]">
      <div className="max-h-60 overflow-y-auto py-1.5 pr-1">
        <div className="mb-1 flex items-center gap-1.5 pl-1 text-chaos-term-fg">
          <FolderOpen aria-hidden className="size-3.5 text-chaos-term-cursor" />
          {/* Standard `tree` root marker — the view lists what the project ships. */}
          <span className="font-semibold">.</span>
        </div>
        {renderRows(nodes, "", 1)}
      </div>

      <div className="border-t border-chaos-line px-2 py-1.5 text-[11px] text-chaos-term-dim">
        <span className="font-semibold tabular-nums text-chaos-accent-dark">
          {dirs}
        </span>{" "}
        {t.treeDirs}
        {dirs !== 0 && files !== 0 ? ", " : ""}
        {files !== 0 ? (
          <>
            {" "}
            <span className="font-semibold tabular-nums text-chaos-accent-dark">
              {files}
            </span>{" "}
            {t.treeFiles}
          </>
        ) : null}
      </div>
    </div>
  );
}
