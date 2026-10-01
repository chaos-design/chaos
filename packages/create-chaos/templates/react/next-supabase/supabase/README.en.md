# Supabase Auth Setup

[中文](README.md) | [English](README.en.md)

This scaffold only uses Supabase Auth. It does not include business tables,
Storage, or an administrative server client. All project SQL is kept in
`platform.sql`, which currently creates the Auth Hook function used to restrict
registration email domains.

## Environment Variables

Get the project URL and Publishable key from Supabase Dashboard Project Settings:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

The browser and Next.js server session clients use these values. The scaffold does not need `SUPABASE_SERVICE_ROLE_KEY`.

## One-Command Hosted Setup

The Supabase CLI is pinned as a development dependency, so no global installation
is required. After cloning, the setup script can discover the Publishable key,
write `.env.local`, configure hosted Auth URLs and templates, and link the CLI:

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

Create a Personal Access Token at
`https://supabase.com/dashboard/account/tokens`. The Project Ref is available in
the project URL or Dashboard Project Settings. Through the official Management
API, the script:

- Fetches only the `publishable` API key, never a service role or secret key.
- Enables Email and signup while retaining email confirmation.
- Configures production, localhost, and `127.0.0.1` confirm/callback URLs.
- Sets six-digit email codes with a one-hour expiry.
- Uploads `templates/confirmation.html` and `templates/magic_link.html`.

The token is read only from `SUPABASE_ACCESS_TOKEN`. An optional database password
is read from `SUPABASE_DB_PASSWORD` for CLI link validation. Neither is written to
project files. The script does not execute `platform.sql`; run the complete file
in the target project's SQL Editor.

To explicitly create a new hosted project:

```bash
pnpm setup:project -- \
  --name my-project \
  --create-supabase-project \
  --supabase-organization your-org-slug \
  --supabase-region ap-southeast-1
```

This mode requires both `SUPABASE_ACCESS_TOKEN` and `SUPABASE_DB_PASSWORD`.
Creating cloud resources may incur charges, so the script never does it
implicitly.

To update only the local `.env.local` without changing hosted Auth:

```bash
pnpm setup:supabase -- \
  --url https://your-project.supabase.co \
  --publishable-key sb_publishable_... \
  --no-configure-remote
```

## Authentication URLs

For local development:

- Site URL: `http://localhost:3344`
- Redirect URLs:
  - `http://localhost:3344/auth/confirm`
  - `http://localhost:3344/auth/callback`

For production:

- Site URL: your production origin
- Redirect URLs:
  - `https://your-domain.example/auth/confirm`
  - `https://your-domain.example/auth/callback`

Registration emails use `/auth/confirm`. After verification, the app clears the
temporary confirmation session and returns to login. Password recovery emails
use `/auth/callback`. Both handlers accept only internal `next` paths. Email OTP
sign-in is verified directly on the login page.

## Email Provider

Enable Email and Confirm email under Authentication Providers. Confirm email is
required by this project's verify-then-login flow. If it is disabled,
registration creates an authenticated session immediately; the app clears that
session and reports the configuration error.

## Registration Email Domains

Registration accepts common providers including QQ, NetEase, Foxmail, Sina,
Sohu, Aliyun, Chinese carrier mail, Gmail, Outlook, Hotmail, iCloud, Yahoo, and
Proton. The frontend rule is defined in
`src/features/auth/auth-form-config.ts`.

The server-side restriction is implemented by `platform.sql`. After executing
the complete file, open **Authentication > Hooks**, add a **Before User Created**
Hook, and select `public.restrict_registration_email_domain`. Without this
binding, callers can bypass the page validation by calling the Supabase Auth API
directly.

Configure a dedicated SMTP provider for production instead of relying on the default email quota.

The two flows use different templates:

- Registration calls `signUp()` and sends a confirmation link with the Confirm
  signup template.
- Sign-in calls `signInWithOtp({ shouldCreateUser: false })` and sends a code
  with the Magic Link template.

Hosted projects do not read or automatically sync `config.toml` or the HTML
templates from this repository. Open **Authentication > Email Templates >
Magic Link** in the Supabase Dashboard, set the subject to "Your sign-in code",
and replace the body with `templates/magic_link.html`. The minimum working body is:

```html
<p>{{ .Token }}</p>
```

Do not output `{{ .ConfirmationURL }}` in the Magic Link template. The Confirm
signup template must send the token hash to the app:

```html
<a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=email">Verify email</a>
```

After saving the hosted template, request a new code. Emails sent before the
template update do not change retroactively.

After starting local Supabase, execute `platform.sql` once. `config.toml` enables
the registration Hook and configures the confirmation link and six-digit sign-in
code. Registration uses the token hash; password recovery continues to use PKCE.

## Adding Business Data

Before adding a table, use the checklist at the top of
[platform.sql](platform.sql) to define form-field mappings, ownership,
constraints, and indexes. Add all executable SQL to that file with these
requirements:

1. Enable Row Level Security.
2. Use `auth.uid()` to enforce ownership.
3. Verify authentication again in Route Handlers or Server Actions.
4. Add a server-only service role client only when administrative access is required.
