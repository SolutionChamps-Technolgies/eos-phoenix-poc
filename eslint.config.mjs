// STQC gate: GIGW 3.0 / WCAG 2.1 AA (jsx-a11y) + OWASP (sonarjs) + React correctness
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import sonarjs from 'eslint-plugin-sonarjs';
import globals from 'globals';

export default tseslint.config(
  {
    // .venv/.mypy_cache/etc: mixed Python+TS monorepos put a Python venv
    // alongside the JS tree - without this ESLint walks into
    // .venv/**/*.js bundled by pip packages (found running against the
    // demo repo 2026-09-02: coverage.py ships its own coverage_html.js).
    ignores: [
      'dist/**', 'build/**', 'coverage/**', 'node_modules/**', '*.config.*',
      '.venv/**', 'venv/**', '.mypy_cache/**', '.pytest_cache/**', '.ruff_cache/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  jsxA11y.flatConfigs.recommended,
  sonarjs.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
      globals: { ...globals.browser, ...globals.es2024 },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      // --- React correctness: the highest-yield rules SonarQube does not have ---
      ...reactHooks.configs.recommended.rules,
      'react-hooks/exhaustive-deps': 'error',

      // --- GIGW 3.0 / WCAG 2.1 AA: promote to blocking ---
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-role': 'error',
      'jsx-a11y/click-events-have-key-events': 'error',
      'jsx-a11y/heading-has-content': 'error',
      'jsx-a11y/html-has-lang': 'error',
      'jsx-a11y/img-redundant-alt': 'error',
      'jsx-a11y/interactive-supports-focus': 'error',
      'jsx-a11y/label-has-associated-control': 'error',
      'jsx-a11y/no-autofocus': 'error',
      'jsx-a11y/no-noninteractive-element-interactions': 'error',
      'jsx-a11y/no-static-element-interactions': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/tabindex-no-positive': 'error',

      // --- Security-adjacent ---
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',

      // --- ISO 25010 maintainability ---
      'sonarjs/cognitive-complexity': ['error', 15],
      'sonarjs/no-duplicate-string': ['warn', { threshold: 4 }],
    },
  },
);
