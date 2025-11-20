import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
	{
		files: [ "**/*.{ts,mts,cts}" ],
		languageOptions: { globals: globals.browser }
	},
	tseslint.configs.recommended, {
		rules: {
			"@typescript-eslint/no-this-alias": "off",
			"no-param-reassign": "error",
			"no-duplicate-imports": "error",
			"sort-imports": [ "error", { allowSeparatedGroups: true } ],
		},
	},
	eslintConfigPrettier,
]);
