# Next.js + shadcn/ui

A production-ready Next.js App Router starter with shadcn/ui, Tailwind CSS,
Base UI, Lucide icons, theme support, TypeScript, and Biome.

## Requirements

- Node.js 20.9 or later
- pnpm 10

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and edit `app/page.tsx` to
start building.

## Available Scripts

| Command          | Description                              |
| ---------------- | ---------------------------------------- |
| `pnpm dev`       | Start the local development server.      |
| `pnpm build`     | Create a production build.               |
| `pnpm start`     | Serve the production build.              |
| `pnpm lint`      | Run Biome checks.                        |
| `pnpm format`    | Format the project with Biome.            |
| `pnpm typecheck` | Generate Next.js types and check TypeScript. |

Run all quality checks before opening a pull request:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Project Structure

```text
.
├── .github/workflows/deploy.yml  # GitHub Pages deployment
├── app/                          # App Router routes and global styles
├── components/                   # Application and shadcn/ui components
├── lib/utils.ts                  # Shared class name helper
├── components.json              # shadcn/ui configuration
├── next.config.ts               # Next.js and GitHub Pages configuration
└── vercel.json                  # Vercel project configuration
```

## Add shadcn/ui Components

```bash
pnpm dlx shadcn@latest add dialog
```

The shadcn CLI uses `components.json` and writes UI components to
`components/ui`. Shared application components belong in `components`.

Theme tokens are defined in `app/globals.css`. `components/theme-provider.tsx`
enables system-aware light and dark themes. Press `D` outside a form field to
toggle the current theme.

## Environment Variables

Create `.env.local` for local-only values. Variables used in browser code must
start with `NEXT_PUBLIC_`. Configure production values in the deployment
provider instead of committing secrets.

## Deploy to Vercel

Vercel supports the complete Next.js runtime used by this project.

1. Import the Git repository in the
   [Vercel dashboard](https://vercel.com/new).
2. Keep the detected framework preset set to **Next.js**.
3. Add any required environment variables and deploy.

Pull requests receive preview deployments when the Vercel Git integration is
enabled. You can also deploy from the command line:

```bash
pnpm dlx vercel@latest
pnpm dlx vercel@latest --prod
```

## Deploy to GitHub Pages

The included `.github/workflows/deploy.yml` workflow builds and publishes the
site whenever `main` is updated.

1. Push the project to GitHub.
2. Open **Settings > Pages** in the repository.
3. Set **Source** to **GitHub Actions**.
4. Push to `main` or run the workflow manually from the **Actions** tab.

The workflow automatically supplies the repository base path and enables a
static export in `next.config.ts`. This Pages build cannot use runtime features
such as Server Actions, request-time rendering, or dynamic API routes. Regular
local and Vercel builds keep the full Next.js runtime.

## Learn More

- [Next.js documentation](https://nextjs.org/docs)
- [shadcn/ui documentation](https://ui.shadcn.com/docs)
- [Tailwind CSS documentation](https://tailwindcss.com/docs)
- [Biome documentation](https://biomejs.dev/guides/getting-started/)
