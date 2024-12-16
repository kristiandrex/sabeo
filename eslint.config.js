import nextPlugin from "@next/eslint-plugin-next";
import reactCompilerPlugin from "eslint-plugin-react-compiler";

export default [
  {
    plugins: {
      "@next/next": nextPlugin,
      "react-compiler": reactCompilerPlugin,
    },
    rules: {
      ...nextPlugin.configs["core-web-vitals"].rules,
      "react-compiler/react-compiler": "error",
    },
  },
];
