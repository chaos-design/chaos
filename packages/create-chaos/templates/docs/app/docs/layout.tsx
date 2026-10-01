import { FloatNav } from '@docs/components/float-nav';
import { SidebarEnhancer } from '@docs/components/sidebar-enhancer';
import { baseOptions } from '@docs/utils/layout.shared';
import { getRecentlyModifiedPagesWithLabels, source } from '@docs/utils/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';

interface DocsLayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: DocsLayoutProps) {
  // Get recently modified pages with labels (last 7 days)
  const recentPagesMap = getRecentlyModifiedPagesWithLabels();

  return (
    <DocsLayout tree={source.pageTree} {...baseOptions()}>
      {children}
      <FloatNav />
      <SidebarEnhancer recentPagesMap={recentPagesMap} />
    </DocsLayout>
  );
}
