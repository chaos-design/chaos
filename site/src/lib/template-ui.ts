import type { ChaosTemplate } from "@/lib/types";

export const PM_ORDER = ["npm", "pnpm", "yarn", "bun"] as const;
export type Pm = (typeof PM_ORDER)[number];

// Command forms mirror the usage documented in the repository README:
// npm 7+, yarn and pnpm need `--` before flags passed to the created package;
// bun passes them directly.
export const buildCommand = (pm: Pm, dir: string, alias: string) => {
  const name = dir.trim() || "chaos-project";
  if (pm === "npm") {
    return `npm create chaos@latest ${name} -- --template ${alias}`;
  }
  return `${pm} create chaos ${name} --template ${alias}`;
};

// kolorist name -> static Tailwind text color (kept static so the JIT
// compiler can see the classes; arbitrary interpolation would be purged).
export const COLOR_CLASS: Record<string, string> = {
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

export const colorClass = (t: ChaosTemplate) =>
  COLOR_CLASS[t.color] ?? COLOR_CLASS.default;

export const choiceMeta = (t: ChaosTemplate) => {
  const alias = t.alias && t.alias !== t.id ? ` | ${t.alias}` : "";
  return `${t.categoryLabel} | ${t.id}${alias}`;
};

export const matchesFilter = (t: ChaosTemplate, keyword: string) => {
  if (!keyword) return true;
  const haystack = [t.title, t.alias, t.id, t.categoryLabel, t.description]
    .join(" ")
    .toLowerCase();
  return haystack.includes(keyword);
};
