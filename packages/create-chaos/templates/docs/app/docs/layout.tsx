import { FloatNav } from "@docs/components/float-nav";
import { SidebarEnhancer } from "@docs/components/sidebar-enhancer";
import { baseOptions } from "@docs/utils/layout.shared";
import { getRecentlyModifiedPagesWithLabels, source } from "@docs/utils/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";

export default function Layout({ children }: LayoutProps<"/docs">) {
  // Get recently modified pages with labels (last 7 days)
  const recentPagesMap = getRecentlyModifiedPagesWithLabels();

  return (
    <DocsLayout
      tree={source.pageTree}
      {...baseOptions()}
    >
      {children}
      <FloatNav />
      <SidebarEnhancer recentPagesMap={recentPagesMap} />
    </DocsLayout>
  );
}
