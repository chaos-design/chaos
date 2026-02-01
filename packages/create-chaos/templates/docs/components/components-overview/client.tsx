"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

type ComponentItem = {
  title: string;
  description?: string;
  href: string;
  preview?: string;
};

type ComponentsOverviewClientProps = {
  items: ComponentItem[];
};

export function ComponentsOverviewClient({
  items,
}: ComponentsOverviewClientProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems = useMemo(() => {
    if (!normalizedQuery) {
      return items;
    }
    return items.filter((item) => {
      const haystack = `${item.title} ${item.description ?? ""}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [items, normalizedQuery]);

  return (
    <div className="not-prose mt-6 space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索组件名称或关键词"
          className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        />
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>共 {items.length} 个组件</span>
        {/* <span>当前展示 {filteredItems.length} 个</span> */}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-lg border bg-card p-2 transition hover:border-primary/60 hover:shadow-sm"
          >
            <div className="mb-3 overflow-hidden rounded-md bg-muted/30">
              <img
                src={item.preview ?? "/chao.png"}
                alt={item.title}
                className="aspect-[16/9] w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="text-sm font-semibold text-foreground">
              {item.title}
            </div>
            <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {item.description || "暂无描述"}
            </div>
            <div className="mt-3 text-xs text-primary/80 group-hover:text-primary">
              查看文档 →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
