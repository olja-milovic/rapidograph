import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";
import { fileURLToPath } from "node:url";
import globals from "globals";
import { includeIgnoreFile } from "@eslint/compat";
import tseslint from "typescript-eslint";

const gitignorePath = fileURLToPath(new URL(".gitignore", import.meta.url));

export default defineConfig([
  includeIgnoreFile(gitignorePath, "Imported .gitignore patterns"),
  {
    files: ["**/*.{ts,mts,cts}"],
    languageOptions: { globals: globals.browser },
  },
  tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-this-alias": "off",
      "no-param-reassign": "error",
      "no-duplicate-imports": "error",
      "sort-imports": ["error", { allowSeparatedGroups: true }],
    },
  },
  eslintConfigPrettier,
]);
