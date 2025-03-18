import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import { globalIgnores } from "eslint/config";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  eslintConfigPrettier,
  {
    rules: {
      "react/react-in-jsx-scope": "off",
    },
  },
  globalIgnores([
    "node_modules",
    "dist",
    "build",
    "coverage",
    "src/components/ui",
  ]),
];
