# Chaos ⚡

> Next Generation Frontend Tooling, designed to accelerate and simplify frontend development.

Chaos is a powerful CLI tool that helps you scaffold projects quickly using best-practice templates. It supports various modern frontend stacks including React, Next.js, and Monorepos.

## Packages

| Package                               | Version (click for changelogs)                                                                                         |
| ------------------------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| [create-chaos](packages/create-chaos) | [![create-chaos version](https://img.shields.io/npm/v/create-chaos.svg?label=%20)](packages/create-chaos/CHANGELOG.md) |

## ✨ Features

- **🚀 Fast Scaffolding**: Create a new project in seconds.
- **🛠️ Modern Stack**: Templates for React, Next.js, TypeScript, and more.
- **📦 Monorepo Support**: Built-in support for pnpm workspaces.
- **🎨 Custom Templates**: Extensible architecture to add your own templates.
- **⚙️ Best Practices**: Pre-configured with Biome, and TypeScript.

## 📦 Installation

You can create a new project using your favorite package manager:

```bash
# npm
npm create chaos@latest

# pnpm
pnpm create chaos

# yarn
yarn create chaos
```

## 🚀 Usage

Follow the interactive prompts to select your project name and template:

```bash
pnpm create chaos my-new-app
```

You can also specify the template directly using the `--template` (or `-t`) flag.

### Supported Templates & Short Commands

| Category | Template Name | Short Command | Description |
|----------|---------------|---------------|-------------|
| **React** | `react-ts` | `react` | Vite + React + TypeScript starter |
| | `react-component-ts` | `reactc` | React component library starter |
| **Library** | `library-ts` | `lib` | TypeScript library starter |
| | `library-react-component-ts` | `libc` | React component library starter |
| **Repo** | `monorepo` | `monorepo` | pnpm workspace monorepo starter |
| **VS Code** | `vscode-extension` | `vse` | VS Code extension starter |
| **Webpack** | `webpack-plugin` | `wp` | Webpack plugin starter |
| **Skill** | `skill` | `skill` | Skill project starter |

**Example:**

```bash
# Create a React + TypeScript project directly
pnpm create chaos my-app --template react

# Create a VS Code extension
pnpm create chaos my-ext -t vse
```

## 🏗️ Project Structure

The Chaos project is organized as a monorepo using pnpm workspaces:

```
chaos/
├── packages/
│   ├── create-chaos/              # The core CLI package
│   │   ├── src/                   # CLI source code
│   │   └── templates/             # Project templates
│   │       ├── library/           # Library templates
│   │       ├── react/             # React templates
│   │       ├── repo/              # Repository templates
│   │       ├── vscode/            # VS Code templates
│   │       └── webpack/           # Webpack templates
├── scripts/                       # Maintenance scripts
└── .github/                       # GitHub Actions workflows
```

## 🔧 Requirements

- **Node.js**: >= 16.0.0
- **pnpm**: >= 8.0.0

## 🤝 Contribution

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Code Style

This project uses [Biome](https://biomejs.dev/) for linting and formatting.

- **Check code**: `pnpm run lint`
- **Format code**: `pnpm run format`

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
