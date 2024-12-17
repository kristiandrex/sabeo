import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";
import reactCompilerPlugin from "eslint-plugin-react-compiler";

export default tseslint.config(
  { ignores: ["node_modules", ".next"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-compiler": reactCompilerPlugin,
      "@next/next": nextPlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      "react-compiler/react-compiler": "error",
    },
  }
);
