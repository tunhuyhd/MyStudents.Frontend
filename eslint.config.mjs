import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    ".test-output/**",
    "next-env.d.ts",
    // Generated Playwright artifacts and externally managed Impeccable skill files.
    "playwright-report/**",
    "test-results/**",
    "artifacts/**",
    ".github/skills/**",
  ]),
]);

export default eslintConfig;
