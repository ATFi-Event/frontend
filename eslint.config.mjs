import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Disable explicit any type errors
      "@typescript-eslint/no-explicit-any": "off",
      // Disable unused variable warnings
      "@typescript-eslint/no-unused-vars": "off",
      // Disable unsafe function type warnings
      "@typescript-eslint/no-unsafe-function-type": "off",
      // Disable missing dependency warnings for useEffect
      "react-hooks/exhaustive-deps": "off",
      // Disable unescaped entities warnings
      "react/no-unescaped-entities": "off",
      // Disable img element warnings (using regular img instead of next/image)
      "@next/next/no-img-element": "off",
    },
  },
];

export default eslintConfig;
