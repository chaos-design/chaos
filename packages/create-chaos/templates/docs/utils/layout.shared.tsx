import Logo from "@docs/components/logo";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { siteConfig } from "@/fumadocs.config";

export function baseOptions(): BaseLayoutProps {
  return {
    themeSwitch: {
      enabled: false,
    },
    i18n: false,
    links: [],
    githubUrl: siteConfig?.links?.github || undefined,
    nav: {
      title: <Logo />,
    },
  };
}
