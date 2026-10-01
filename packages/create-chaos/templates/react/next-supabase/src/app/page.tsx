import {
  ArrowRightIcon,
  BracesIcon,
  CheckCircle2Icon,
  DatabaseIcon,
  KeyRoundIcon,
  LockKeyholeIcon,
  MailCheckIcon,
  RefreshCwIcon,
  RouteIcon,
  ServerCogIcon,
  ShieldCheckIcon,
  SquareTerminalIcon,
} from "lucide-react"
import Link from "next/link"
import { ScaffoldNav } from "../components/scroll-aware-headers"
import { Badge } from "../components/ui/badge"
import { buttonVariants } from "../components/ui/button"

const includedCapabilities = [
  {
    icon: KeyRoundIcon,
    title: "完整邮箱认证",
    description: "密码、验证码、常用邮箱注册限制、邮箱确认与密码恢复已经接通。",
    path: "src/features/auth",
  },
  {
    icon: ShieldCheckIcon,
    title: "双层私有路由保护",
    description: "Proxy 刷新会话，页面服务端再次校验用户，不依赖客户端判断。",
    path: "src/proxy.ts",
  },
  {
    icon: RouteIcon,
    title: "安全回跳",
    description: "登录、确认与恢复流程统一过滤 next 参数，避免开放重定向。",
    path: "src/server/auth",
  },
  {
    icon: DatabaseIcon,
    title: "统一平台 SQL",
    description: "注册限制 Hook 与后续业务 SQL 统一维护，部署入口清晰可审查。",
    path: "supabase/platform.sql",
  },
] as const

const requestFlow = [
  {
    icon: RefreshCwIcon,
    label: "01 / Proxy",
    title: "刷新 Supabase 会话",
    detail: "每次私有页面请求先同步 Cookie 与会话状态。",
  },
  {
    icon: ServerCogIcon,
    label: "02 / Server",
    title: "服务端读取当前用户",
    detail: "页面渲染前再次执行身份校验，未登录直接回到登录页。",
  },
  {
    icon: LockKeyholeIcon,
    label: "03 / Route",
    title: "进入受保护工作台",
    detail: "认证通过后才渲染 /workspace，业务代码从这里开始。",
  },
] as const

export default function HomePage() {
  return (
    <main className="scaffold-home">
      <ScaffoldNav>
        <Link className="brand-mark" href="/">
          <span aria-hidden="true">N/S</span>
          <span>next-supabase-scaffold</span>
        </Link>
        <div className="scaffold-nav-links">
          <Link href="#included">核心能力</Link>
          <Link href="#architecture">认证架构</Link>
        </div>
        <Link
          data-nav-action="true"
          className={buttonVariants({ variant: "outline", size: "sm" })}
          href="/login"
        >
          登录
        </Link>
      </ScaffoldNav>

      <section className="scaffold-hero" aria-labelledby="scaffold-title">
        <div className="scaffold-hero-scene" aria-hidden="true">
          <div className="scaffold-hero-grid" />
          <div className="scaffold-stack-window">
            <header>
              <span>REQUEST / AUTH PIPELINE</span>
              <strong>LIVE</strong>
            </header>
            <div>
              <span>01</span>
              <p>
                <small>REQUEST</small>
                <strong>Next.js Proxy</strong>
              </p>
              <b>PASS</b>
            </div>
            <div>
              <span>02</span>
              <p>
                <small>SESSION</small>
                <strong>Supabase SSR</strong>
              </p>
              <b>SYNC</b>
            </div>
            <div>
              <span>03</span>
              <p>
                <small>IDENTITY</small>
                <strong>Server Component</strong>
              </p>
              <b>USER</b>
            </div>
            <footer>
              <span>GET /workspace</span>
              <strong>200</strong>
            </footer>
          </div>
          <div className="scaffold-code-window">
            <header>
              <span>proxy.ts</span>
              <i />
            </header>
            <code>
              <span>const</span> {"{"} authenticated {"}"} = <strong>await</strong>{" "}
              updateSession(request)
              <br />
              <br />
              <span>if</span> (!authenticated) redirect(loginUrl)
              <br />
              <span>return</span> response
            </code>
          </div>
        </div>
        <div className="scaffold-hero-copy">
          <Badge variant="secondary">
            <CheckCircle2Icon data-icon="inline-start" aria-hidden="true" />
            AUTHENTICATION READY
          </Badge>
          <p className="scaffold-kicker">NEXT.JS 16 / SUPABASE SSR / TYPESCRIPT</p>
          <h1 id="scaffold-title">next-supabase-scaffold</h1>
          <p>
            一个克制、可替换的全栈起点。认证、常用邮箱注册限制、安全回跳、
            会话刷新与私有路由已经完成，你只需要接入自己的业务数据。
          </p>
          <div className="scaffold-hero-actions">
            <Link className={buttonVariants({ size: "lg" })} href="/workspace">
              打开私有工作台
              <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
            </Link>
            <Link
              className={buttonVariants({ variant: "outline", size: "lg" })}
              href="#included"
            >
              查看已包含能力
            </Link>
          </div>
        </div>
        <div className="scaffold-hero-meta" aria-hidden="true">
          <span>APP ROUTER</span>
          <span>SERVER-FIRST AUTH</span>
          <span>MINIMAL ENV</span>
        </div>
      </section>

      <section className="scaffold-status-strip" aria-label="脚手架状态">
        <span>
          <i />
          BUILD TARGET
          <strong>Next.js App Router</strong>
        </span>
        <span>
          <i />
          AUTH PROVIDER
          <strong>Supabase Email</strong>
        </span>
        <span>
          <i />
          PRIVATE ENTRY
          <strong>/workspace</strong>
        </span>
        <span>
          <i />
          REQUIRED ENV
          <strong>2 variables</strong>
        </span>
      </section>

      <section
        className="scaffold-section scaffold-included"
        id="included"
        aria-labelledby="included-title"
      >
        <header className="scaffold-section-heading">
          <div>
            <span>01 / INCLUDED</span>
            <h2 id="included-title">基础设施已经完成，业务保持空白。</h2>
          </div>
          <p>
            认证模块属于稳定核心；`/workspace` 是刻意保持简单的登录后示例区，
            可以直接替换成你的产品。
          </p>
        </header>

        <div className="scaffold-capability-grid">
          {includedCapabilities.map(
            ({ icon: Icon, title, description, path }, index) => (
              <article key={title}>
                <header>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <Icon aria-hidden="true" />
                </header>
                <h3>{title}</h3>
                <p>{description}</p>
                <code>{path}</code>
              </article>
            ),
          )}
        </div>
      </section>

      <section
        className="scaffold-section scaffold-architecture"
        id="architecture"
        aria-labelledby="architecture-title"
      >
        <header className="scaffold-section-heading">
          <div>
            <span>02 / REQUEST PATH</span>
            <h2 id="architecture-title">身份判断始终留在服务端边界。</h2>
          </div>
          <p>
            浏览器客户端只使用公开配置。私有页面同时保留 Proxy 与页面服务端校验，
            新增写操作时再在 Route Handler 或 Server Action 内校验一次。
          </p>
        </header>

        <div className="scaffold-request-layout">
          <section className="scaffold-terminal" aria-label="最小环境配置示例">
            <header>
              <span>
                <SquareTerminalIcon aria-hidden="true" />
                .env.local
              </span>
              <i />
            </header>
            <pre>
              <code>
                <span>NEXT_PUBLIC_SUPABASE_URL</span>=https://your-project.supabase.co
                {"\n"}
                <span>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</span>=your-publishable-key
              </code>
            </pre>
            <footer>
              <BracesIcon aria-hidden="true" />
              No service role required
            </footer>
          </section>

          <ol className="scaffold-request-flow">
            {requestFlow.map(({ icon: Icon, label, title, detail }) => (
              <li key={label}>
                <Icon aria-hidden="true" />
                <div>
                  <span>{label}</span>
                  <h3>{title}</h3>
                  <p>{detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="scaffold-section scaffold-next" aria-labelledby="next-title">
        <div>
          <span>03 / START BUILDING</span>
          <h2 id="next-title">从登录后的页面开始写业务。</h2>
          <p>
            先替换 `/workspace`，再按数据归属设计表结构、约束、索引与 RLS。
            认证模块无需重复实现。
          </p>
        </div>
        <Link className={buttonVariants({ size: "lg" })} href="/workspace">
          进入工作台
          <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
        </Link>
      </section>

      <footer className="scaffold-footer">
        <div className="brand-mark brand-mark-compact">
          <span aria-hidden="true">N/S</span>
          <span>next-supabase-scaffold</span>
        </div>
        <p>Next.js + Supabase authentication starter.</p>
        <div>
          <MailCheckIcon aria-hidden="true" />
          <Link href="/terms">服务条款</Link>
          <Link href="/privacy">隐私政策</Link>
        </div>
      </footer>
    </main>
  )
}
