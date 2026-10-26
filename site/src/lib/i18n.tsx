"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { ChaosTemplate } from "@/lib/types";

export type Locale = "zh" | "en";

const STORAGE_KEY = "chaos-locale";

export interface UiStrings {
  tagline: string;
  docsLink: string;
  /** Suffix of the terminal chrome title ("create-chaos — …"). */
  chromeTitle: string;
  templatesWord: string;
  filterLabel: string;
  filterAllHint: string;
  filterMatch: (count: number) => string;
  dirLabel: string;
  dirHint: string;
  pmLabel: string;
  selectLabel: string;
  selectEmpty: string;
  noMatch: (query: string) => string;
  keysHint: string;
  copyBtn: string;
  copied: string;
  inspectorTitle: string;
  selectedMark: string;
  browsingMark: string;
  includesLabel: string;
  nextLabel: string;
  commandLabel: string;
  metaTemplate: string;
  metaAlias: string;
  metaCategory: string;
  metaSource: string;
  emptyPanel: string;
  emptyPanelHint: string;
  pickedNote: string;
  pickBtn: string;
}

const STRINGS: Record<Locale, UiStrings> = {
  zh: {
    tagline: "选一个模板，复制命令，直接开跑。",
    docsLink: "模板文档",
    chromeTitle: "模板选择",
    templatesWord: "模板",
    filterLabel: "筛选模板",
    filterAllHint: "空白即列出全部",
    filterMatch: (n) => `${n} 个匹配 · Esc 清除`,
    dirLabel: "项目名",
    dirHint: "留空回退 chaos-project",
    pmLabel: "包管理器",
    selectLabel: "选择模板",
    selectEmpty: "- 从下方挑选一个模板。",
    noMatch: (q) => `- 没有匹配 “${q}” 的模板。`,
    keysHint: "- ↑/↓ 或 j/k 浏览 · Enter 选择 · / 筛选 · c 复制 · ←/→ 切换包管理器",
    copyBtn: "复制命令",
    copied: "已复制",
    inspectorTitle: "检查器",
    selectedMark: "已选用",
    browsingMark: "浏览中",
    includesLabel: "包含",
    nextLabel: "下一步",
    commandLabel: "命令",
    metaTemplate: "模板",
    metaAlias: "别名",
    metaCategory: "分类",
    metaSource: "来源",
    emptyPanel: "没有匹配的模板。",
    emptyPanelHint: "清空筛选以继续浏览。",
    pickedNote: "已选用，底部命令已就绪",
    pickBtn: "选用此模板",
  },
  en: {
    tagline: "Pick a template, copy the command, run it.",
    docsLink: "Template docs",
    chromeTitle: "template picker",
    templatesWord: "templates",
    filterLabel: "Filter templates",
    filterAllHint: "empty lists all",
    filterMatch: (n) => `${n} match${n === 1 ? "" : "es"} · Esc to clear`,
    dirLabel: "Project name",
    dirHint: "empty falls back to chaos-project",
    pmLabel: "Package manager",
    selectLabel: "Select a template",
    selectEmpty: "- Pick a template below.",
    noMatch: (q) => `- No templates match "${q}".`,
    keysHint:
      "- ↑/↓ or j/k browse · Enter choose · / filter · c copy · ←/→ package manager",
    copyBtn: "Copy command",
    copied: "Copied",
    inspectorTitle: "inspector",
    selectedMark: "selected",
    browsingMark: "browsing",
    includesLabel: "Includes",
    nextLabel: "Next",
    commandLabel: "Command",
    metaTemplate: "template",
    metaAlias: "alias",
    metaCategory: "category",
    metaSource: "source",
    emptyPanel: "No matching templates.",
    emptyPanelHint: "Clear the filter to keep browsing.",
    pickedNote: "selected — the command below is ready",
    pickBtn: "Use this template",
  },
};

/**
 * Chinese titles/descriptions for the generated templates. The English copy is
 * the source of truth (synced from the CLI config into `data/templates.ts`);
 * this map only overrides it in zh mode, keyed by template id. An unknown id
 * simply falls back to the generated English text.
 */
export const TEMPLATE_ZH: Record<string, { title: string; description: string }> =
  {
    "react-ts": {
      title: "TypeScript 项目",
      description: "基于 Vite、React 与 TypeScript 的浏览器应用。",
    },
    "react-component-ts": {
      title: "组件",
      description: "带作用域 Sass 样式的聚焦型 React 组件。",
    },
    "react-next-shadcn": {
      title: "Next.js + shadcn/ui",
      description: "使用 Tailwind CSS 与 shadcn/ui 的 Next.js App Router。",
    },
    "react-next-supabase": {
      title: "Next.js + Supabase",
      description:
        "使用 Supabase SSR 认证、Tailwind CSS 与 shadcn/ui 的 Next.js App Router。",
    },
    "browser-extension-wxt": {
      title: "WXT 浏览器扩展",
      description: "跨浏览器扩展，含 React、TypeScript、Tailwind CSS 与 shadcn/ui。",
    },
    "library-ts": {
      title: "TypeScript 库",
      description: "使用 tsup 构建可发布的 TypeScript 库。",
    },
    "library-react-component-ts": {
      title: "React 组件库",
      description: "带 playground 的、经过测试的 React 组件库。",
    },
    "webpack-plugin": {
      title: "Webpack 插件",
      description: "带可运行 demo 的类型化 Webpack 插件。",
    },
    "vscode-extension": {
      title: "VS Code 扩展",
      description: "带 React 驱动 webview 的 VS Code 扩展。",
    },
    monorepo: {
      title: "Monorepo 单体仓库",
      description: "带共享仓库工具的 pnpm workspace。",
    },
    docs: {
      title: "文档站点",
      description: "使用 Fumadocs 驱动的 Next.js 文档站点。",
    },
  };

interface LocaleContextValue {
  locale: Locale;
  t: UiStrings;
  setLocale: (locale: Locale) => void;
  /** Template title in the active locale (zh overrides the generated en). */
  templateTitle: (template: ChaosTemplate) => string;
  /** Template description in the active locale. */
  templateDescription: (template: ChaosTemplate) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

/**
 * 中/EN switching. The pre-hydration script in `layout.tsx` restores the
 * stored preference onto `<html lang>`; the provider adopts it after mount so
 * state and DOM never disagree.
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh");

  useEffect(() => {
    setLocaleState(document.documentElement.lang === "en" ? "en" : "zh");
  }, []);

  const value = useMemo<LocaleContextValue>(() => {
    const pick = (zh: string | undefined, fallback: string) =>
      locale === "zh" ? (zh ?? fallback) : fallback;

    return {
      locale,
      t: STRINGS[locale],
      setLocale: (next: Locale) => {
        setLocaleState(next);
        document.documentElement.lang = next === "en" ? "en" : "zh-CN";
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {
          // private browsing — the toggle still works for the session
        }
      },
      templateTitle: (template) =>
        pick(TEMPLATE_ZH[template.id]?.title, template.title),
      templateDescription: (template) =>
        pick(TEMPLATE_ZH[template.id]?.description, template.description),
    };
  }, [locale]);

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return ctx;
}
