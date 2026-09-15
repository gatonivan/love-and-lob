import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // scripts/audit/ is an untracked, local-only debugging scratch space (not
  // part of the shipped code), so it's excluded rather than linted.
  globalIgnores(['dist', 'scripts/audit']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  // The branch's api/*.js (Vercel serverless functions and their shared
  // helpers) and scripts/*.mjs (the reconcile job, build-time fetch scripts)
  // were previously unlinted entirely — this config only ever scoped to
  // .ts/.tsx. Forward-looking hygiene, not a bug hunt.
  {
    files: ['**/*.{js,mjs}'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: globals.node,
    },
  },
])
