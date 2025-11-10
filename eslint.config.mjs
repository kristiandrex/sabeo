import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";
import tseslint from "typescript-eslint";
import reactCompilerPlugin from "eslint-plugin-react-compiler";

export default tseslint.config(
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "node_modules/**",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    plugins: {
      "react-compiler": reactCompilerPlugin,
    },
    rules: {
      "react-compiler/react-compiler": "error",
    },
  },
);
