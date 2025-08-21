// eslint.config.mjs
// Flat config for ESLint v9+
import js from '@eslint/js';
import globals from 'globals';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // Ignore common output folders
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      'coverage/',
      // --- TODO(Behrang): legacy paths — re-enable lint gradually ---
      'views/lichess/page/tool/stockfish.js-master/**',
      'module/**',
      'public/**',
      'rout/**',
      'index.js',
    ],
  },

  // Base recommended rules
  js.configs.recommended,

  // App code (Node + browser)
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Instead of `env: { node: true, browser: true }`
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
    },
  },

  // Tests (vitest/jest style globals)
  {
    files: ['**/*.{test,spec}.{js,mjs,cjs}'],
    languageOptions: {
      globals: {
        ...globals.node,
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly', // vitest
      },
    },
  },
];
