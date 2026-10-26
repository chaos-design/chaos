import type { Metadata } from "next";

import { LocaleProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chaos Design · 模板库",
  description: "选择任意 chaos 模板，复制可直接执行的 CLI 命令，快速创建项目。",
};

/**
 * Runs before first paint: restores the stored locale/theme preferences onto
 * `<html>` so a returning visitor never sees a flash of the default
 * (zh + dark) look. The Locale/Theme providers re-read these attributes on
 * mount and stay in sync from then on.
 */
const bootScript = `(function(){
  try {
    var locale = localStorage.getItem("chaos-locale");
    var theme = localStorage.getItem("chaos-theme");
    document.documentElement.lang = locale === "en" ? "en" : "zh-CN";
    document.documentElement.setAttribute("data-theme", theme === "light" ? "light" : "dark");
  } catch (e) {
    document.documentElement.lang = "zh-CN";
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" data-theme="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <LocaleProvider>{children}</LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
