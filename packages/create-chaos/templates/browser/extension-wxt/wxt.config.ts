import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'wxt';

import { appConfig } from './config/app-config';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: ({ browser }) => ({
    browser_specific_settings:
      browser === 'firefox'
        ? {
            gecko: {
              data_collection_permissions: {
                required: ['none'],
              },
            },
          }
        : undefined,
    description: appConfig.description,
    homepage_url: appConfig.github.repositoryUrl || undefined,
    name: appConfig.name,
    permissions: ['storage', 'sidePanel'],
    short_name: appConfig.shortName,
  }),
  hooks: {
    'build:manifestGenerated': (wxt, manifest) => {
      if (wxt.config.browser === 'firefox') {
        manifest.permissions = manifest.permissions?.filter(
          (permission) => permission !== 'sidePanel',
        );
      }
    },
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
