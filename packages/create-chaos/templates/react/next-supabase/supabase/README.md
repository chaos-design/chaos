# Supabase Auth 配置

[中文](README.md) | [English](README.en.md)

当前脚手架只使用 Supabase Auth，不包含业务表、Storage 或服务端管理客户端。所有项目
SQL 统一维护在 `platform.sql`，当前用于创建注册邮箱域名限制所需的 Auth Hook 函数。

## 环境变量

从 Supabase Dashboard 的 Project Settings 获取项目 URL 和 Publishable key：

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

这两个值用于浏览器和 Next.js 服务端的用户会话客户端。脚手架不需要 `SUPABASE_SERVICE_ROLE_KEY`。

## 一键配置托管项目

项目已将 Supabase CLI 固定为开发依赖，无需全局安装。clone 后可以由初始化脚本自动获取
Publishable key、写入 `.env.local`、配置 Auth URL 和邮件模板并执行 CLI link：

```bash
read -s SUPABASE_ACCESS_TOKEN
export SUPABASE_ACCESS_TOKEN

pnpm setup:project -- \
  --name my-project \
  --display-name "My Project" \
  --supabase-project-ref abcdefghijklmnopqrst \
  --site-url https://app.example.com

unset SUPABASE_ACCESS_TOKEN
```

Personal Access Token 从
`https://supabase.com/dashboard/account/tokens` 创建，Project Ref 可在项目 URL 或
Dashboard Project Settings 中找到。脚本通过官方 Management API：

- 获取 `publishable` 类型 API key，不读取或写入 service role/secret key。
- 启用 Email Provider 和注册，保持 Confirm email。
- 设置 Site URL，以及生产、本地 `localhost` 和 `127.0.0.1` 的 confirm/callback URL。
- 设置 6 位、1 小时有效的邮箱验证码。
- 同步 `templates/confirmation.html` 和 `templates/magic_link.html`。

令牌只从 `SUPABASE_ACCESS_TOKEN` 环境变量读取。数据库密码只在 CLI link 需要校验数据库时
通过可选的 `SUPABASE_DB_PASSWORD` 读取，两者都不会写入项目文件。脚本不会自动执行
`platform.sql`；需在目标项目的 SQL Editor 中完整执行。

还可以显式创建全新的托管项目：

```bash
pnpm setup:project -- \
  --name my-project \
  --create-supabase-project \
  --supabase-organization your-org-slug \
  --supabase-region ap-southeast-1
```

该模式要求同时设置 `SUPABASE_ACCESS_TOKEN` 和 `SUPABASE_DB_PASSWORD`。创建云资源可能产生
费用，因此脚本不会默认创建项目。

只想更新本地 `.env.local`、不改变云端 Auth 时：

```bash
pnpm setup:supabase -- \
  --url https://your-project.supabase.co \
  --publishable-key sb_publishable_... \
  --no-configure-remote
```

## Authentication URL 配置

本地开发：

- Site URL：`http://localhost:3344`
- Redirect URLs：
  - `http://localhost:3344/auth/confirm`
  - `http://localhost:3344/auth/callback`

生产环境：

- Site URL：你的正式站点域名
- Redirect URLs：
  - `https://your-domain.example/auth/confirm`
  - `https://your-domain.example/auth/callback`

注册邮件进入 `/auth/confirm`，验证成功后会清除确认过程产生的临时会话并返回登录页。密码重设邮件进入
`/auth/callback`。两个回调都只接受站内 `next` 路径，避免开放重定向。邮箱验证码登录由登录页直接校验，
无需经过回调。

## Email Provider

在 Authentication Providers 中启用 Email，并必须开启 Confirm email。关闭该选项会让注册直接创建已登录会话，
不符合本项目“验证后返回登录页”的安全流程。应用检测到这种错误配置时会立即清除本地会话并提示管理员。

## 注册邮箱域名限制

注册仅接受 QQ、网易、Foxmail、新浪、搜狐、阿里云、运营商邮箱，以及 Gmail、Outlook、
Hotmail、iCloud、Yahoo、Proton 等常用邮箱域名。前端规则位于
`src/features/auth/auth-form-config.ts`。

服务端限制由 `platform.sql` 创建的 `public.restrict_registration_email_domain` 函数
执行。完整执行该文件后，还需在 Supabase Dashboard 的 **Authentication > Hooks** 中新增
**Before User Created** Hook，选择该 Postgres 函数。未绑定 Hook 时，直接调用 Supabase
Auth API 仍可绕过页面校验。

正式环境建议配置自有 SMTP，避免使用默认邮件额度。

两种邮件使用不同模板：

- 注册调用 `signUp()`，使用 Confirm signup 模板发送确认链接。
- 登录调用 `signInWithOtp({ shouldCreateUser: false })`，使用 Magic Link 模板发送验证码。

托管项目不会读取或自动同步仓库中的 `config.toml` 和 HTML 模板。打开
Supabase Dashboard 的 **Authentication > Email Templates > Magic Link**，将主题改为
“您的登录验证码”，并将正文替换为 `templates/magic_link.html` 的内容。最小可用正文为：

```html
<p>{{ .Token }}</p>
```

Magic Link 模板不要输出 `{{ .ConfirmationURL }}`。Confirm signup 模板必须发送
token hash 链接：

```html
<a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=email">验证邮箱</a>
```

保存云端模板后重新点击“获取验证码”；修改前已经发送的邮件不会随模板更新。

本地 Supabase 启动后也需要完整执行一次 `platform.sql`；`config.toml` 会启用注册 Hook，
并配置确认链接与 6 位登录验证码。注册使用 token hash，密码重设回调使用 PKCE。

## 新增业务数据

新增表前先按 [platform.sql](platform.sql) 顶部清单确认表单字段映射、归属关系、
约束和索引，再将可执行 SQL 补充到该文件。实现时应：

1. 启用 Row Level Security。
2. 使用 `auth.uid()` 约束数据所有者。
3. 在 Route Handler 或 Server Action 中再次校验身份。
4. 只在确实需要管理权限时新增服务端 service role 客户端。
