import type { Metadata } from "next"
import "./globals.css"
export const metadata: Metadata = {
  title: {
    default: "next-supabase-scaffold",
    template: "%s · next-supabase-scaffold",
  },
  description: "Next.js 16 + Supabase SSR 邮箱认证脚手架。",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
