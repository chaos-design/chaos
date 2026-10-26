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
  /** Optional Chinese overrides for the inspector panel. */
  nextZh?: string;
  requiresZh?: string;
  stackZh?: string[];
}
