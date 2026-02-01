import { source } from "@docs/utils/source";
import { ComponentsOverviewClient } from "./client";

type ComponentItem = {
  title: string;
  description?: string;
  href: string;
  preview?: string;
};

type ComponentsOverviewProps = {
  from: string;
  cover?: string;
};

export function ComponentsOverview({
  from,
  cover,
}: ComponentsOverviewProps) {
  if (!from) {
    return null;
  }

  const items = source
    .getPages()
    .filter((page) => page.url.startsWith(`${from}/`))
    .filter((page) => page.url !== from)
    .map((page) => ({
      title: page.data.title,
      description: page.data.description,
      href: page.url,
      preview: page.data?.preview,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));

  return (
    <ComponentsOverviewClient
      items={items as ComponentItem[]}
    />
  );
}
