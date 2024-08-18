const { defineConfig } = require('eslint-define-config');

module.exports = defineConfig({
  root: true,
  extends: ['chaos'],
  rules: {
    'jsonc/sort-keys': 'off',
  },
});
