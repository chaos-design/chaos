const { defineConfig } = require('eslint-define-config');

module.exports = defineConfig({
  env: { browser: true, es2020: true },
  extends: [
    'chaos',
  ],
  rules: {
  },
});
