# next-supabase-scaffold

[English](./README.en.md)

一个可直接开始业务开发的 Next.js 16 + Supabase 认证脚手架。项目保持最小业务假设，
只提供公开首页、完整邮箱认证流程和登录后的私有工作台。

## 已包含

- 邮箱密码登录、邮箱验证码登录、常用邮箱域名注册与邮箱确认。
- 找回密码、重设密码、退出登录和认证错误本地化。
- Next.js Proxy 会话刷新与 `/workspace` 私有路由保护。
- 页面服务端二次身份校验与安全回跳地址过滤。
- 服务条款、隐私政策模板和响应式认证表单。
- TypeScript、Biome、Vitest、Tailwind CSS 与 shadcn/ui。

## 项目边界

- `src/features/auth/` 是稳定认证核心，不应在业务开发中重复实现。
- `src/app/workspace/` 是登录后的可替换业务起点。
- 当前 Supabase 配置只使用 Auth 和注册限制 Hook，不包含业务表、Storage 或 service role。
- 所有项目 SQL 统一维护在 `supabase/platform.sql`。

## 页面

| 路径 | 访问 | 用途 |
| --- | --- | --- |
| `/` | 公开 | 脚手架能力与架构说明 |
| `/login` | 公开 | 密码、邮箱验证码和注册入口 |
| `/register` | 公开 | 重定向到登录页注册模式 |
| `/forgot-password` | 公开 | 发送密码重设邮件 |
| `/reset-password` | 恢复会话 | 设置新密码 |
| `/auth/confirm` | 公开处理器 | 邮箱确认 |
| `/auth/callback` | 公开处理器 | Supabase 回调 |
| `/workspace` | 登录后 | 私有业务起点 |
| `/terms`、`/privacy` | 公开 | 法律模板 |

## 注册邮箱限制

新账号仅允许以下常用邮箱域名：

```text
qq.com
163.com / 126.com / yeah.net
foxmail.com / sina.com / sina.cn / sohu.com / aliyun.com
139.com / 189.cn / wo.cn
gmail.com / outlook.com / hotmail.com / live.com
icloud.com / me.com / yahoo.com / proton.me / protonmail.com
```

该限制只作用于注册，不影响已有账号登录、邮箱验证码登录或找回密码。注册表单负责即时
提示，`supabase/platform.sql` 中的 Before User Created Hook 负责服务端最终校验。

## 开始使用

要求 Node.js 20+ 和 pnpm 11。

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

开发端口统一由 `scaffold.config.json` 的 `devPort` 管理。可直接编辑该字段，也可运行：

```bash
pnpm config:show
pnpm config:port -- 3100
```

`pnpm dev` 和 `pnpm start` 会直接读取该配置；`pnpm setup:supabase` 与
`pnpm supabase:start` 会自动同步本地 Supabase 回调地址。手动修改配置后也可单独运行
`pnpm config:sync`。

最小环境变量：

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

在 Supabase Authentication 中启用 Email Provider 和 Confirm email，并将本地及生产站点的
回调 URL 加入允许列表。注册仅接受常用邮箱服务商域名；数据库 Hook 和邮件模板说明见
[`supabase/README.md`](./supabase/README.md)。

## Clone 后一键配置

非技术人员请直接阅读
[`docs/non-technical-quick-start.md`](./docs/non-technical-quick-start.md)，手册内含 5 张带标注的
界面示意图，逐图说明该看哪里、该复制什么。英文版见
[`docs/non-technical-quick-start.en.md`](./docs/non-technical-quick-start.en.md)。

准备 Supabase Personal Access Token 和 20 位 Project Ref。令牌只通过环境变量读取：

```bash
read -s SUPABASE_ACCESS_TOKEN
export SUPABASE_ACCESS_TOKEN

pnpm setup:project -- \
  --name my-project \
  --display-name "My Project" \
  --description "My Next.js and Supabase application." \
  --author "Your Team" \
  --repository "git@github.com:your-org/my-project.git" \
  --supabase-project-ref abcdefghijklmnopqrst \
  --site-url https://app.example.com \
  --reset-git \
  --commit \
  --build

unset SUPABASE_ACCESS_TOKEN
```

该命令会修改项目元信息和品牌、写入被忽略的 `.env.local`、自动获取
Publishable key、配置 Supabase Email Auth/回调 URL/邮件模板、关联 Supabase CLI、
安装锁文件依赖、执行质量检查和可选构建。脚本不会自动执行 SQL；完成后需在 Supabase
SQL Editor 完整执行 `supabase/platform.sql`，再将
`public.restrict_registration_email_domain` 绑定为 Before User Created Hook。

## 创建自己的项目

完整的私有化、配置替换、Git 历史清理、依赖管理和验证流程见
[`docs/scaffold-migration-guide.md`](./docs/scaffold-migration-guide.md)。

也可以直接生成一个无旧历史、无本地密钥和无构建缓存的新项目：

```bash
./scripts/create-project.sh \
  --name my-project \
  --display-name "My Project" \
  --description "My Next.js and Supabase application." \
  --author "Your Team" \
  --repository "git@github.com:your-org/my-project.git"
```

使用 `./scripts/create-project.sh --help` 查看安装依赖、Git 初始化、首次提交、
Supabase 项目 ID 和开发端口等参数。

## 质量检查

```bash
pnpm check
pnpm build
```

项目使用 TypeScript、Biome 和 Vitest，不使用 ESLint。
