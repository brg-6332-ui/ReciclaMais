/* global process */
import js from '@eslint/js'
import pluginTs from '@typescript-eslint/eslint-plugin'
import parserTs from '@typescript-eslint/parser'
import pluginA11y from 'eslint-plugin-jsx-a11y'
import pluginPrettier from 'eslint-plugin-prettier'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import pluginSolid from 'eslint-plugin-solid'
import globals from 'globals'
import eslintPluginImport from 'eslint-plugin-import'
import love from 'eslint-config-love'

/** @type {import('eslint').Linter.Config} */
export default [
  {
    ...love,
    // Restrict linting to the frontend source files only to avoid vendor/build outputs
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      parser: parserTs,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        project: ['./tsconfig.json'],
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        process: 'readonly',
        NodeJS: 'readonly',
        '__COMMIT_SHA__': 'readonly',
        'google': 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': pluginTs,
      solid: pluginSolid,
      prettier: pluginPrettier,
      'jsx-a11y': pluginA11y,
      'simple-import-sort': simpleImportSort,
      import: eslintPluginImport,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...pluginTs.configs?.['recommended-type-checked']?.rules,
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
      'import/no-unresolved': ['error'],
      eqeqeq: ['error', 'always'],
      'prettier/prettier': [
        'error',
        {
          printWidth: 80,
          tabWidth: 2,
          singleQuote: true,
          trailingComma: 'all',
          arrowParens: 'always',
          semi: false,
          endOfLine: 'auto',
        },
      ],
      'solid/reactivity': 'error',
    },
    settings: {
      'import/parsers': {
        [parserTs]: ['.ts', '.tsx', '.d.ts'],
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: ['./tsconfig.json'],
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.d.ts'],
        },
      },
    },
  },
  {
    ignores: [
      'node_modules',
      'dist',
      'build',
      'public',
      '.vinxi',
      '.output',
      // ignore Vercel function outputs and other generated files
      '.vercel',
      // config files that may use CJS/ESM mixing
      'tailwind.config.cjs',
      'frontend/.vercel',
    ],
  },
]
