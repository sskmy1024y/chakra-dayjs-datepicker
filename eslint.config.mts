import { FlatCompat } from '@eslint/eslintrc';
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

const compat = new FlatCompat();

export default [
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    ignores: [
      "node_modules/**/*",
      "example/**/*"
    ],
  },
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...compat.extends('plugin:react-hooks/recommended'),
  {
    ...pluginReact.configs.flat?.recommended,
    settings: {
      react: {
        version: "detect"
      }
    }
  },
  {
    // eslint-plugin-react-hooks の設定
    rules: {
      'react-hooks/exhaustive-deps': 'error', // recommended では warn のため error に上書き
    },
  },
];
