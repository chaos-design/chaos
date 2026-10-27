export interface ChaosTemplate {
  id: string;
  alias: string;
  category: string;
  categoryLabel: string;
  title: string;
  description: string;
  /** kolorist color name, e.g. "cyan", "magenta" — matches config.ts. */
  color: string;
  /** Template directory inside the CLI package, e.g. "react/ts". */
  path: string;
}

/**
 * A node in the inspector's file manifest. A folder may list its children
 * (rendered as an expandable `tree`/VS-Code-style branch) and/or carry a
 * `count` of children that is shown as a dim badge when it is not expanded.
 * Names are the post-rename values the generated project actually ships.
 */
export interface FileNode {
  name: string;
  type: "file" | "folder";
  /** Number of children (folders + files). Drives the badge on a folder. */
  count?: number;
  /** Nested children. When present the folder is expandable in the tree. */
  children?: FileNode[];
}

/**
 * Presentation-only metadata for a template: the context the CLI's one-line
 * description has no room for, surfaced in the inspector panel.
 *
 * Curated from `docs/templates.md` so the page and the documentation say the
 * same thing. `CHAOS_TEMPLATES` stays generated from the CLI config — this file
 * never redeclares ids, aliases or descriptions, it only annotates them.
 */
export interface TemplateDetail {
  /** Stack the template wires up, rendered as chips. */
  stack: string[];
  /** What actually ships in the generated project. */
  includes: string[];
  /** Environment or toolchain requirement, if any. */
  requires?: string;
  /** The first thing to run once the project exists. */
  next: string;
  /**
   * Nestable manifest of the shipped files, rendered as a `tree`/VS-Code-style
   * collapsible file tree. `includes` stays as the flat, documentation copy;
   * this is the richer interactive view. Optional — a template without one
   * falls back to the flat list.
   */
  fileTree?: FileNode[];
  /** Optional Chinese overrides for the inspector panel. */
  nextZh?: string;
  requiresZh?: string;
  stackZh?: string[];
}
