# AGENTS.md

本文面向在本仓库内工作的 AI Coding Agent，说明脚手架目标、项目边界与质量要求。

## 项目目标

- 本项目是可直接开始业务开发的 Next.js + Supabase 脚手架。
- 邮箱密码登录、注册、邮箱验证码、邮箱验证、找回密码、重设密码、退出登录、会话刷新和私有路由保护均属于已经完成的基础设施。
- 新增业务时应复用现有认证能力，不重复实现登录注册，不把认证状态改成仅客户端判断。
- `src/app/workspace/` 是可替换的登录后业务示例区；认证模块和安全边界不是示例代码。
- 首页只说明脚手架能力与认证架构，不预设具体业务领域或数据模型。
- 认证表单的字段、校验、提交状态、错误反馈、协议同意和可访问性属于稳定核心；页面外壳、内容编排和视觉风格可以按业务自由替换。

## 项目边界

- `src/app/`：Next.js App Router 页面和 Route Handlers。
- `src/components/`：跨功能共享 UI。
- `src/features/`：按业务功能组织的客户端组件。
- `src/features/auth/`：完整认证 UI 与客户端认证交互。
- `src/lib/supabase/`：Supabase 浏览器、服务端和 proxy 客户端。
- `src/server/`：仅服务端使用的认证与业务逻辑。
- `src/proxy.ts`：Next.js 16 私有页面会话刷新与路由保护入口。
- `docs/`：面向维护者的项目规范；样式变更需同步样式规范。

## 代码规则

- 前端文件名使用全小写并以连字符分隔。
- 函数名使用小驼峰；React 组件和类型使用 PascalCase。
- TypeScript 保持严格类型，不引入 `any`。
- 格式统一使用 Biome，不新增 ESLint。
- 只在逻辑不易自解释时添加简短注释。
- 不把服务端密钥、真实用户信息或生产配置写入代码、文档或日志。
- 优先使用 Server Component；只在交互、浏览器 API 或动画需要时添加 `"use client"`。
- 不为简单逻辑增加依赖，新增依赖前确认现有工具链无法合理解决。
- 认证字段长度、格式和校验文案集中在
  `src/features/auth/auth-form-config.ts`，新增认证表单时复用同一配置。

## 样式规则

- 完整规范见 `docs/style-guide.md`，实现与文档必须保持一致。
- 当前视觉为克制的开发者控制台风格；登录页外部结构可以重做，但认证字段、反馈和安全边界必须保留。
- 改造外观时不得破坏认证表单结构、交互状态、键盘操作、错误关联、协议链接和响应式可用性。
- 颜色、字体、阴影和布局值优先使用 `src/app/globals.css` 中的设计令牌。
- 共享交互控件保持 44px 以上点击区域、清晰焦点态和完整禁用态。
- 图标统一使用 Lucide；纯图标按钮必须提供可访问名称。
- 响应式以内容稳定为准，沿用 980px 和 640px 两级断点。
- 动画优先 CSS；当前项目不依赖 GSAP，不为简单动效新增运行时依赖。
- JS 动画只修改 `transform` 和 `opacity`，必须清理监听器并遵循 `prefers-reduced-motion`。

## 认证规则

- 浏览器客户端只使用公开的 Supabase URL 和 Publishable key。
- 私有页面同时保留 proxy 保护与页面服务端身份校验。
- 所有登录回跳地址必须经过 `sanitizeRedirectPath`。
- 新增业务写操作时，在 Route Handler 或 Server Action 内重新校验用户。
- 如果新增 service role key，只能在服务端模块中读取和使用。
- 所有项目 SQL 统一维护在 `supabase/platform.sql`，不要创建其他 SQL 文件。
- 新增业务表前按该文件清单明确表单字段映射、归属关系、约束、索引和 RLS。
- 登录邮箱验证码输入只保留数字但不限制位数，保持 `one-time-code`
  自动填充与服务端验证；发送成功后必须保留 60 秒重发冷却。
- 不删除认证错误本地化、加载态、输入校验、密码显隐或减少动态效果支持。

## 常用命令

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

提交结果前至少运行 `pnpm check`。认证边界、Next.js 配置或生产构建相关改动还应运行 `pnpm build`。
