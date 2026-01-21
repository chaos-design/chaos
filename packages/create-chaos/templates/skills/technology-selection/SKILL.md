---
title: Technology Selection
description: Select the appropriate technology stack, tools, and architecture for the project.
---

# Technology Selection

Select the appropriate technology stack, tools, and architecture for the project.

## When to use

Always run `technology-selection .` when:
- User requests to build a project, ability, or component.
- User requests architecture decisions or project structure setup.

## How to use

### Step 1: Analyze User Requirements

Extract key information from user request:
- **Scope**: frontend, backend, mobile, desktop, web
- **Scale**: new project, existing feature, component
- **Specific Needs**: auth, styling, formatting, package management

### Step 2: Determine Project Architecture

**Monorepo Structure (Default for new/empty projects)**
- **Tooling**: pnpm (package manager), Biome (formatter/linter)
- **Directory Structure**:
  - `apps/`: Frontend applications (web, mobile, desktop)
  - `server/`: Backend services (API, workers, jobs)
  - `packages/`: Shared libraries, UI kits, utilities, types

### Step 3: Select Technology Stack

#### Frontend Stack (Default)
- **Framework**: React + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: lucide-react
- **UI Library**: shadcn/ui
- **Build Tool**: Vite

**Special Configurations:**
- **Vite + Tailwind**: 
  - Must include Babel plugin for JSX source tracing
  - See Data: ViteTailwindConfig
- **Authentication (Login/Sign-up)**:
  - Prefer **Better Auth**
  - See Data: BetterAuth
- **Database (Frontend Direct)**:
  - Prefer **Supabase**
  - See Data: Supabase

#### Backend Stack (Default)
- **Runtime**: Node.js
- **Language**: TypeScript

#### Tooling & Infrastructure
- **Package Manager**: pnpm
- **Formatter/Linter**: Biome
- **Monorepo Manager**: pnpm workspace (built-in) or Turborepo (optional)
- **CI/CD (Frontend Monorepo)**:
  - Add GitHub Actions for Git Pages deployment
  - See Data: GitHubActionsGitPages

### Step 4: Output Decision Plan

Summarize the selected stack and structure:
1. **Architecture**: Monorepo vs Polyrepo (default to Monorepo for new projects)
2. **Structure**: Define `apps/`, `server/`, `packages/` locations
3. **Tech Stack**: Frontend, Backend, Tooling choices
4. **Configuration Actions**:
   - Initialize pnpm workspace
   - Setup Biome
   - If Frontend Monorepo: Configure CI/CD (GitHub Actions) in root
   - Apply specific configs (Vite source tracing, Better Auth, Supabase) if applicable

## Data

### ViteTailwindConfig

See [data/vite-tailwind.md](./data/vite-tailwind.md) for Babel plugin and Vite configuration details.

### BetterAuth

See [data/better-auth.md](./data/better-auth.md) for implementation details.

### GitHubActionsGitPages

See [data/github-actions-git-pages.md](./data/github-actions-git-pages.md) for workflow configuration details.

### Supabase

See [data/supabase.md](./data/supabase.md) for implementation details.
