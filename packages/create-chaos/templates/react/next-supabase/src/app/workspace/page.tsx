import {
  CheckCircle2Icon,
  Code2Icon,
  DatabaseIcon,
  KeyRoundIcon,
  RouteIcon,
  ServerCogIcon,
  ShieldCheckIcon,
} from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { WorkspaceHeader } from "../../components/scroll-aware-headers"
import { Badge } from "../../components/ui/badge"
import { SignOutButton } from "../../features/auth/sign-out-button"
import { getOptionalAuthUser } from "../../server/auth/auth-user"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "私有工作台",
  description: "登录后访问的 Next.js + Supabase 私有业务起点。",
}

const nextSteps = [
  {
    path: "src/app/workspace/page.tsx",
    title: "替换当前示例页面",
    description: "从这个 Server Component 开始接入你的真实业务界面。",
  },
  {
    path: "supabase/platform.sql",
    title: "定义业务表与 RLS",
    description: "先明确字段映射、归属、约束、索引，再提交可执行 SQL。",
  },
  {
    path: "Route Handler / Server Action",
    title: "实现服务端写操作",
    description: "每次业务写入都重新校验当前用户，不信任客户端身份。",
  },
] as const

export default async function WorkspacePage() {
  const user = await getOptionalAuthUser()
  if (!user) {
    redirect("/login?next=%2Fworkspace")
  }

  return (
    <main className="workspace-shell">
      <WorkspaceHeader>
        <Link className="brand-mark brand-mark-compact" href="/">
          <span aria-hidden="true">N/S</span>
          <span>next-supabase-scaffold</span>
        </Link>
        <div className="workspace-account">
          <div>
            <span>当前账户</span>
            <strong>{user.email ?? "已认证用户"}</strong>
          </div>
          <Badge variant="outline">
            <ShieldCheckIcon data-icon="inline-start" aria-hidden="true" />
            已验证
          </Badge>
          <SignOutButton />
        </div>
      </WorkspaceHeader>

      <section className="workspace-intro" aria-labelledby="workspace-title">
        <div>
          <span>PRIVATE ROUTE / READY</span>
          <h1 id="workspace-title">私有工作台已就绪。</h1>
          <p>
            当前页面已通过 Proxy 会话刷新与服务端用户校验。
            这里是脚手架刻意保留的业务起点。
          </p>
        </div>
        <Badge variant="secondary">
          <CheckCircle2Icon data-icon="inline-start" aria-hidden="true" />
          AUTHENTICATED
        </Badge>
      </section>

      <section className="workspace-status-grid" aria-label="认证基础设施状态">
        <article>
          <KeyRoundIcon aria-hidden="true" />
          <span>SESSION</span>
          <h2>Supabase Auth</h2>
          <p>服务端已读取当前用户，会话 Cookie 正常生效。</p>
          <strong>CONNECTED</strong>
        </article>
        <article>
          <RouteIcon aria-hidden="true" />
          <span>ROUTE</span>
          <h2>/workspace</h2>
          <p>未登录请求由 Proxy 重定向至登录页，并保留安全回跳地址。</p>
          <strong>PROTECTED</strong>
        </article>
        <article>
          <ServerCogIcon aria-hidden="true" />
          <span>RENDER</span>
          <h2>Server Component</h2>
          <p>身份校验发生在页面渲染前，不依赖客户端认证状态。</p>
          <strong>SERVER FIRST</strong>
        </article>
      </section>

      <section className="workspace-launchpad" aria-labelledby="launchpad-title">
        <header>
          <div>
            <span>NEXT STEPS</span>
            <h2 id="launchpad-title">接入业务的建议顺序</h2>
          </div>
          <Code2Icon aria-hidden="true" />
        </header>
        <ol>
          {nextSteps.map((step, index) => (
            <li key={step.path}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <code>{step.path}</code>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="workspace-contract" aria-labelledby="contract-title">
        <div>
          <DatabaseIcon aria-hidden="true" />
          <span>DATA CONTRACT</span>
          <h2 id="contract-title">业务数据默认不做假设。</h2>
          <p>
            当前 Supabase 配置只包含 Auth。添加第一张业务表前，
            请同时设计用户归属、唯一约束、查询索引和 Row Level Security。
          </p>
        </div>
        <pre>
          <code>
            <span>user_id</span> uuid references auth.users
            {"\n"}
            <span>enable row level security</span>
            {"\n"}
            using (auth.uid() = user_id)
          </code>
        </pre>
      </section>
    </main>
  )
}
