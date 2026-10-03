# Non-Technical Quick Start

[中文](./non-technical-quick-start.md) | [English](./non-technical-quick-start.en.md)

This guide configures the template into your own project. The whole flow only
requires working in the Supabase Dashboard, pasting terminal commands, and
editing a few values.

> The images in this guide are **illustrations**. They use the sample project
> name `customer-portal`, the sample Project Ref `abcdefghijklmnopqrst`, and
> redacted values to show what a correct result looks like. The homepage
> illustration shows a Chinese display name (`客户服务平台`) as its sample; your
> own display name may be in any language. Real screens follow the actual
> Supabase and browser interfaces, so version numbers and button positions may
> change when Supabase updates its UI.

## Before You Start

Confirm the following with the technical owner:

- The HTTPS address of the template repository.
- A lowercase English project name such as `customer-portal`, using only
  lowercase letters, digits, and hyphens.
- A project display name, for example `Customer Portal`.
- An existing Supabase project.
- The 20-character Project Ref of that Supabase project.
- A Supabase Personal Access Token.

Your computer needs Node.js 20+, pnpm 11, and Git. Open Terminal and run:

```bash
node --version
pnpm --version
git --version
```

Continue when all three commands print a version number. If you see
`command not found`, ask a developer to install the missing tool first.

![Environment check: node, pnpm, and git all print version numbers](./screenshots/01-environment-check.png)

> **Screenshot 1: Environment check**
>
> The frame must contain the version numbers of `node`, `pnpm`, and `git`.
>
> Do not include your computer username or personal directories.

## Step 1: Download the Template

Copy the whole block into Terminal and edit only the values inside the first
two pairs of quotes:

```bash
TEMPLATE_REPO="https://github.com/your-org/your-starter.git"
PROJECT_FOLDER="customer-portal"

git clone "$TEMPLATE_REPO" "$PROJECT_FOLDER"
cd "$PROJECT_FOLDER"
```

When it finishes, the terminal should not show a red error.

## Step 2: Collect Supabase Details

### Get the Project Ref

1. Sign in to the [Supabase Dashboard](https://supabase.com/dashboard).
2. Open the project you want to use.
3. Read the browser address, for example:

```text
https://supabase.com/dashboard/project/abcdefghijklmnopqrst
```

The final 20 lowercase letters, `abcdefghijklmnopqrst`, are the Project Ref.

![Project Ref: the 20 lowercase letters after /project/ in the address bar](./screenshots/02-project-ref.png)

> **Screenshot 2: Project Ref**
>
> The frame must contain the top of the Supabase project page and the browser
> address bar, with a box around the 20 letters after `/project/`.
>
> Do not include API keys, database passwords, or user data.

### Create a Personal Access Token

1. Click the avatar in the top-right corner of the Supabase page.
2. Open **Account Settings**.
3. Open **Access Tokens**.
4. Click **Generate new token**.
5. Use the English project name as the token name, then copy the token
   immediately after creating it.

![Access Tokens page: the Generate new token button is boxed](./screenshots/03-access-token.png)

> **Screenshot 3: Create an access token**
>
> The frame must contain the **Account Settings > Access Tokens** page, with a
> box around the **Generate new token** button.
>
> Do not capture the generated token. It is shown in full only once, and must
> never be sent through chat or email.

## Step 3: Run the One-Command Setup

Set the project details in Terminal first. Edit only the values inside the
quotes on the right-hand side:

```bash
PROJECT_NAME="customer-portal"
DISPLAY_NAME="Customer Portal"
PROJECT_REF="abcdefghijklmnopqrst"
```

The brand mark in the top-left corner is derived from `DISPLAY_NAME`
automatically, so there is nothing extra to set. `Customer Portal` becomes
`C/P`, and `客户服务平台` becomes `客/户`.

Then enter:

```bash
read -s SUPABASE_ACCESS_TOKEN
export SUPABASE_ACCESS_TOKEN
```

When Terminal waits for input, paste the access token you copied and press
Enter. Nothing is echoed while you type, which is expected.

Continue with:

```bash
pnpm setup:project -- \
  --name "$PROJECT_NAME" \
  --display-name "$DISPLAY_NAME" \
  --supabase-project-ref "$PROJECT_REF" \
  --no-link-supabase
```

Wait a few minutes. The script will:

- Update the project name and page branding.
- Configure Supabase sign-in, email confirmation, one-time codes, and callback URLs.
- Create the local configuration file.
- Install dependencies and check the project.

You have succeeded when you see:

```text
Project setup completed.
```

To stop people from registering with uncommon email domains by bypassing the
sign-up form, finish two more steps in the Supabase Dashboard:

1. Open **SQL Editor** and create a new query.
2. Paste the full contents of `supabase/platform.sql` from the project and run it.
3. Open **Authentication > Hooks** and add a **Before User Created** Hook.
4. Select the Postgres function `public.restrict_registration_email_domain`, then save.

Finally, clear the temporary token from Terminal:

```bash
unset SUPABASE_ACCESS_TOKEN
```

![Setup complete: the terminal prints Project setup completed with a project summary](./screenshots/04-setup-completed.png)

> **Screenshot 4: Setup complete**
>
> The frame must contain roughly the last 10 lines of Terminal output, including
> `Project setup completed.`, the project name, and the Supabase Project Ref.
>
> Before capturing, confirm the frame contains no `SUPABASE_ACCESS_TOKEN`, no
> `sbp_` token, and no API key.

## Step 4: Start the Project

Run:

```bash
pnpm dev
```

Open the printed address in your browser once you see `http://localhost:3344`:

[http://localhost:3344](http://localhost:3344)

`3344` is the default. If `devPort` in `scaffold.config.json` has been changed,
open the address Terminal actually prints.

Check the following:

1. The homepage shows your new project name.
2. Clicking sign-in opens the login page.
3. Registration with a common email domain receives a Supabase confirmation email.
4. Registering with a domain such as `example.com` shows an error.

Press `Control + C` in Terminal to stop the project.

![Project homepage: the new project name and the sign-in button are boxed](./screenshots/05-project-home.png)

> **Screenshot 5: Project homepage**
>
> The frame must contain the full browser page, with boxes around the new
> project name and the sign-in button.
>
> Do not show test account emails, one-time codes, or browser-saved passwords.

## Troubleshooting

### `command not found`

Node.js, pnpm, or Git is missing. Send the full error screenshot to the
technical owner.

### `Invalid project ref`

Copy the 20 lowercase letters after `/project/` in the Supabase project address
again.

### `Unauthorized` or `401`

The access token is invalid or expired. Create a new one on the Supabase
**Access Tokens** page and restart from Step 3.

### The page does not open

Confirm the terminal running `pnpm dev` is still open and shows no red error.
Run `pnpm config:show` to read `devPort`, then open the matching
`http://localhost:<devPort>` address.

### No confirmation email arrives

Check spam first. If it still does not arrive, send the terminal error and a
Supabase Authentication page screenshot to the technical owner, but never send
tokens, API keys, passwords, or one-time codes.

## Definition of Done

- Terminal shows `Project setup completed.`
- `pnpm dev` starts successfully.
- The homepage shows the new project name.
- The login and registration pages open.
- `supabase/platform.sql` ran completely and the Before User Created Hook is bound.
- Common email domains receive a confirmation email, and uncommon ones are rejected.
