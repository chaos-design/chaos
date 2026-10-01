import {
  CheckCircle2Icon,
  RefreshCwIcon,
  ServerCogIcon,
  ShieldCheckIcon,
} from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { LoginForm } from "../../features/auth/login-form"
import { getOptionalAuthUser } from "../../server/auth/auth-user"
import { getEmailConfirmationFeedback } from "../../server/auth/email-confirmation"
import { sanitizeRedirectPath } from "../../server/auth/redirect-path"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "登录",
  description: "登录 next-supabase-scaffold 私有工作台。",
}

interface LoginPageProps {
  searchParams: Promise<{
    next?: string | string[]
    error?: string | string[]
    confirmation?: string | string[]
    mode?: string | string[]
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [query, user] = await Promise.all([searchParams, getOptionalAuthUser()])
  const rawNext = Array.isArray(query.next) ? query.next[0] : query.next
  const nextPath = sanitizeRedirectPath(rawNext)
  const errorCode = Array.isArray(query.error) ? query.error[0] : query.error
  const confirmationStatus = Array.isArray(query.confirmation)
    ? query.confirmation[0]
    : query.confirmation
  const requestedMode = Array.isArray(query.mode) ? query.mode[0] : query.mode
  const initialMode = requestedMode === "register" ? "register" : "password"
  const confirmationFeedback = getEmailConfirmationFeedback(confirmationStatus)
  const routeError =
    errorCode === "recovery-link"
      ? "重设密码链接无效或已过期，请重新获取。"
      : errorCode === "callback"
        ? "验证链接无效或已过期，请重新登录。"
        : ""

  if (user) {
    redirect(nextPath)
  }

  return (
    <main className="auth-shell auth-login-shell">
      <div className="auth-login-grid" aria-hidden="true" />

      <Link className="brand-mark auth-login-brand" href="/">
        <span aria-hidden="true">N/S</span>
        <span>next-supabase-scaffold</span>
      </Link>

      <section className="auth-login-layout">
        <div className="auth-login-story">
          <div className="auth-story-copy">
            <span>NEXT + SUPABASE / AUTH</span>
            <h1>
              认证链路，
              <em>已经替你接通。</em>
            </h1>
            <p>密码、邮箱验证码、注册确认、会话刷新与私有路由保护均已完成。</p>
          </div>

          <div className="auth-request-map" aria-hidden="true">
            <div className="auth-request-node">
              <RefreshCwIcon />
              <span>COOKIE</span>
              <strong>Session refresh</strong>
            </div>
            <i />
            <div className="auth-request-node">
              <ServerCogIcon />
              <span>SERVER</span>
              <strong>User validation</strong>
            </div>
            <i />
            <div className="auth-request-node auth-request-node-active">
              <ShieldCheckIcon />
              <span>ROUTE</span>
              <strong>Private workspace</strong>
            </div>
          </div>

          <div className="auth-story-facts">
            <span>
              <CheckCircle2Icon aria-hidden="true" />
              EMAIL VERIFIED
            </span>
            <span>SERVER FIRST</span>
            <span>SAFE REDIRECT</span>
          </div>
        </div>

        <section className="auth-entry" aria-label="登录账户">
          <LoginForm
            key={initialMode}
            nextPath={nextPath}
            initialError={confirmationFeedback?.error || routeError}
            initialMessage={confirmationFeedback?.message}
            initialMode={initialMode}
          />
        </section>
      </section>

      <Link className="auth-login-back" href="/">
        返回首页
      </Link>
    </main>
  )
}
