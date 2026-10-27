"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronRight, File, Folder, FolderOpen } from "lucide-react";

import { useLocale } from "@/lib/i18n";
import type { FileNode } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * A `tree`-command-style collapsible file manifest.
 *
 * The connectors are drawn by CSS (`.chaos-tree` in globals.css): each level
 * is a nested `ul`, `li` carries a fixed pixel indent, and `::before`/`::after`
 * hairlines paint the `│` guide and the `├──`/`└──` tick. That keeps the icons
 * and names on a shared column — mixing monospace glyphs with pixel-sized
 * icons never lines up, so the lines are pixels here, not characters.
 *
 * Folders expand/collapse (chevron + open/closed icon); a collapsed folder
 * shows a dim count badge like the VS Code explorer. The root label sits above
 * the rows and a `tree`-style stat line — `<N> directories, <M> files` —
 * closes the view, with the counts tinted in the accent colour.
 *
 * Every folder starts open; the tree scrolls inside its max height. Expansion
 * is local state keyed by `<template>:<node-path>` so switching templates
 * re-seeds the defaults.
 */

/** Recount the reachable dirs and files under `items` (excluding the root). */
function tally(items: FileNode[], acc: { dirs: number; files: number }): void {
  for (const node of items) {
    if (node.type === "folder") {
      acc.dirs += 1;
      if (node.children?.length) tally(node.children, acc);
    } else {
      acc.files += 1;
    }
  }
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
    const walk = (list: FileNode[], prefix: string) => {
      for (const node of list) {
        if (node.type === "folder" && node.children?.length) {
          const path = prefix ? `${prefix}/${node.name}` : node.name;
          keys.add(`${template}:${path}`);
          walk(node.children, path);
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

  const renderRows = (items: FileNode[], pathPrefix: string): React.ReactNode =>
    items.map((node) => {
      const path = pathPrefix ? `${pathPrefix}/${node.name}` : node.name;
      const key = keyOf(path);
      const isFolder = node.type === "folder";
      const isOpen = isFolder && open.has(key);

      return (
        <li
          key={key}
          role="treeitem"
          aria-expanded={isFolder ? isOpen : undefined}
        >
          <button
            type="button"
            disabled={!isFolder}
            onClick={() => isFolder && toggle(path)}
            className={cn(
              "group flex h-[22px] w-full items-center gap-1 rounded pr-1.5 text-left leading-none",
              isFolder &&
                "cursor-pointer transition-colors hover:bg-chaos-hover-bg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-chaos-term-cursor",
            )}
          >
            {/* Chevron slot: always reserved (12px) so the name column lines
                up across folder and file rows — a file gets a blank slot. */}
            <span aria-hidden className="flex w-3 shrink-0 justify-center">
              {isFolder ? (
                <ChevronRight
                  className={cn(
                    "size-3 text-chaos-term-dim transition-transform duration-150",
                    isOpen && "rotate-90 text-chaos-term-cursor",
                  )}
                />
              ) : null}
            </span>
            {isFolder ? (
              isOpen ? (
                <FolderOpen
                  aria-hidden
                  className="size-3.5 shrink-0 text-chaos-term-cursor"
                />
              ) : (
                <Folder
                  aria-hidden
                  className="size-3.5 shrink-0 text-chaos-warn"
                />
              )
            ) : (
              <File
                aria-hidden
                className="size-3.5 shrink-0 text-chaos-term-dim"
              />
            )}
            <span
              className={cn(
                "min-w-0 truncate text-chaos-meta-fg",
                isFolder && "font-medium",
              )}
            >
              {node.name}
            </span>
            {isFolder && !isOpen && node.count != null ? (
              <span className="ml-auto shrink-0 rounded bg-chaos-chip-bg px-1 text-[10px] tabular-nums text-chaos-chip-fg">
                {node.count}
              </span>
            ) : null}
          </button>

          {isOpen && node.children?.length ? (
            <ul>{renderRows(node.children, path)}</ul>
          ) : null}
        </li>
      );
    });

  return (
    <div
      role="tree"
      aria-label="files"
      className="chaos-scroll font-mono text-[11.5px]"
    >
      <div className="max-h-60 overflow-y-auto py-1.5 pl-2 pr-1">
        <div className="mb-0.5 flex h-[22px] items-center gap-1.5 text-chaos-term-fg">
          <FolderOpen aria-hidden className="size-3.5 text-chaos-term-cursor" />
          {/* Standard `tree` root marker — the view lists what the project ships. */}
          <span className="font-semibold">.</span>
        </div>
        <ul className="chaos-tree">{renderRows(nodes, "")}</ul>
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
