# create-chaos

## Scaffolding Your First Project

> **Compatibility Note:**
> Vite requires [Node.js](https://nodejs.org/en/) version 14.18+, 16+. However, some templates require a higher Node.js version to work, please upgrade if your package manager warns about it.

With NPM:

```bash
$ npm create chaos@latest
```

With Yarn:

```bash
$ yarn create chaos
```

With PNPM:

```bash
$ pnpm create chaos
```

Then follow the prompts!

You can also directly specify the project name and the template you want to use via additional command line options. For example, to scaffold a Vite + React project, run:

```bash
# npm 6.x
npm create chaos@latest my-react-app --template react-ts

# npm 7+, extra double-dash is needed:
npm create chaos@latest my-react-app -- --template react-ts

# yarn
yarn create chaos my-react-app --template react-ts

# pnpm
pnpm create chaos my-react-app --template react-ts
```

Currently supported template presets include:

- `react`
  - `react-ts`
  - `component`

- `lib`
  - `typescript`

- `repository`
  - `monorepo`

- `Others`
  - `Custom`

You can use `.` for the project name to scaffold in the current directory.

### Custom

- Create a template file wherever you want.
- Create a `chaos.config.[js, cjs, mjs, ts]` file in your execution directory, or add a `chaos` field in the `package.json` with the following configuration.

  **package.json**

  ```json
  {
    "chaos": {
      "template": [
        {
          "name": "gallery",
          "path": "../../../gallery"
        }
      ]
    }
  }
  ```

  **chaos.config.ts**

  ```ts
  export default {
    template: [
      {
        name: 'config gallery',
        path: '../../../gallery',
        ignore: ['node_modules', '.git'],
        renameFiles: {
          'README.md': 'README.zh.md',
        },
        replace: (file, content) => {
          if (file.includes('gitignore')) {
            return `${content}\nchaos`;
          }

          return '';
        },
      },
    ],
  };
  ```

  Note: When both `package.json` and `chaos.config.[js, cjs, mjs, ts]` files exist in the project, the configurations are merged. Also, if you don't have any configurations, you can simply input the path to your template based on the command.

- Run `pnpm create chaos@latest`.

## Community Templates

create-vite is a tool to quickly start a project from a basic template for popular frameworks. Check out Awesome Vite for [community maintained templates](https://github.com/vitejs/awesome-vite#templates) that include other tools or target different frameworks. You can use a tool like [degit](https://github.com/Rich-Harris/degit) to scaffold your project with one of the templates.

```bash
npx degit user/project my-project
cd my-project

npm install
npm run dev
```

If the project uses `main` as the default branch, suffix the project repo with `#main`

```bash
npx degit user/project#main my-project
```
