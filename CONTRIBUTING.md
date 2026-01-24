# Chaos Contributing Guide

Hi! We're really excited that you're interested in contributing to chaos! Before submitting your contribution, please read through the following guide.

It is organized as a series of tasks for aspiring programmers to complete, each with a specific aim.

Here, we will introduce the contribution process for the chaos library.

## Repo Setup

1. Fork the repository.
2. Clone the repository to your local machine.
3. Install dependencies: `pnpm install`.

## Code Style

This project uses [Biome](https://biomejs.dev/) for linting and formatting. We recommend installing the [Biome VS Code extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) for the best developer experience.

- **Lint**: Run `pnpm run lint` to check for code quality issues.
- **Format**: Run `pnpm run format` to format your code.

Please ensure your code passes all checks before submitting a pull request.

## Development

- **Build**: `pnpm run build`
- **Test**: `pnpm run test`
