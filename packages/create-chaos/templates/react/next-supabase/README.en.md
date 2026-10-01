# next-supabase-scaffold

[中文](./README.md)

A production-minded Next.js 16 + Supabase authentication scaffold. It keeps
business assumptions minimal and provides a public homepage, a complete email
authentication flow, and a private post-login workspace.

## Included

- Email/password login, email code login, common-domain registration, and email confirmation.
- Password recovery, password reset, sign-out, and localized auth errors.
- Next.js Proxy session refresh and `/workspace` route protection.
- A second server-side user check and sanitized redirect paths.
- Terms, privacy templates, and responsive authentication forms.
- TypeScript, Biome, Vitest, Tailwind CSS, and shadcn/ui.

## Boundaries

- `src/features/auth/` is stable authentication infrastructure.
- `src/app/workspace/` is the replaceable post-login business starting point.
- Supabase uses Auth and a registration policy Hook, with no business tables, Storage, or service role.
- Keep all project SQL in `supabase/platform.sql`.

## Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Scaffold capabilities and architecture |
| `/login` | Public | Password, email code, and registration |
| `/register` | Public | Redirects to registration mode |
| `/forgot-password` | Public | Sends a password reset email |
| `/reset-password` | Recovery session | Sets a new password |
| `/auth/confirm` | Public handler | Confirms an email address |
| `/auth/callback` | Public handler | Handles Supabase callbacks |
| `/workspace` | Authenticated | Private business starting point |
| `/terms`, `/privacy` | Public | Legal templates |

## Registration Email Policy

New accounts accept these common email domains:

```text
qq.com
163.com / 126.com / yeah.net
foxmail.com / sina.com / sina.cn / sohu.com / aliyun.com
139.com / 189.cn / wo.cn
gmail.com / outlook.com / hotmail.com / live.com
icloud.com / me.com / yahoo.com / proton.me / protonmail.com
```

This policy applies only to registration. Existing-account sign-in, email-code
sign-in, and password recovery remain unrestricted. The registration form gives
immediate feedback, while the Before User Created Hook in
`supabase/platform.sql` provides final server-side enforcement.

## Getting Started

Requires Node.js 20+ and pnpm 11.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

The development port is managed by `devPort` in `scaffold.config.json`. Edit the
field directly or run:

```bash
pnpm config:show
pnpm config:port -- 3100
```

`pnpm dev` and `pnpm start` read this configuration directly. `pnpm
setup:supabase` and `pnpm supabase:start` synchronize local Supabase callback
URLs automatically. After a manual edit, run `pnpm config:sync` when only the
generated local Supabase settings need to be refreshed.

Minimal environment:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Enable the Email Provider and Confirm email in Supabase Authentication, then allow
the local and production callback URLs. Registration accepts common email
provider domains only. See
[`supabase/README.en.md`](./supabase/README.en.md) for database and email template
setup.

## One-Command Setup After Clone

Prepare a Supabase Personal Access Token and the 20-character Project Ref. The
token is read only from the environment:

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

This updates metadata and branding, creates the ignored `.env.local`, discovers
the Publishable key, configures hosted Email Auth, callbacks and templates, links
the Supabase CLI project, installs the lockfile, runs checks, and optionally
builds. It does not execute SQL. Afterwards, run `supabase/platform.sql` in the
Supabase SQL Editor and bind `public.restrict_registration_email_domain` as the
Before User Created Hook.

## Create Your Own Project

See
[`docs/scaffold-migration-guide.en.md`](./docs/scaffold-migration-guide.en.md)
for the full privatization, configuration replacement, Git history cleanup,
dependency management, and verification workflow.

Generate a project without inherited history, local secrets, or build caches:

```bash
./scripts/create-project.sh \
  --name my-project \
  --display-name "My Project" \
  --description "My Next.js and Supabase application." \
  --author "Your Team" \
  --repository "git@github.com:your-org/my-project.git"
```

Run `./scripts/create-project.sh --help` for dependency installation, Git
initialization, first commit, Supabase project ID, and development port options.

## Quality Checks

```bash
pnpm check
pnpm build
```

The project uses TypeScript, Biome, and Vitest. ESLint is not used.
