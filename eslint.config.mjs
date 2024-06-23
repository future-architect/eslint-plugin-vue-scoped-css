import myPlugin from "@ota-meshi/eslint-plugin";
import tseslint from "typescript-eslint";
import vueScopedCss from "eslint-plugin-vue-scoped-css";

export default [
  {
    ignores: [
      ".nyc_output",
      "coverage",
      "dist",
      "node_modules",
      "assets",
      "!docs/.vitepress",
      "docs/.vitepress/dist",
      "docs/.vitepress/cache",
      "docs/.vitepress/build-system/shim",
      "fixtures",
      "tests/lib/styles/fixtures",
      "package-lock.json",
      "!.github",
      "!.vscode",
    ],
  },
  ...myPlugin.config({
    node: true,
    ts: true,
    eslintPlugin: true,
    json: true,
    yaml: true,
    prettier: true,
    packageJson: true,
    vue3: true,
  }),
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
    },

    rules: {
      "jsdoc/require-jsdoc": "error",
      "no-warning-comments": "warn",
      "no-lonely-if": "off",
      "@typescript-eslint/ban-ts-ignore": "off",
      "@typescript-eslint/no-non-null-assertion": "off",

      "no-restricted-properties": [
        "error",
        {
          object: "context",
          property: "getSourceCode",
          message: "Use src/utils/compat.ts",
        },
        {
          object: "context",
          property: "getFilename",
          message: "Use src/utils/compat.ts",
        },
        {
          object: "context",
          property: "getPhysicalFilename",
          message: "Use src/utils/compat.ts",
        },
        {
          object: "context",
          property: "getCwd",
          message: "Use src/utils/compat.ts",
        },
        {
          object: "context",
          property: "getScope",
          message: "Use src/utils/compat.ts",
        },
        {
          object: "context",
          property: "parserServices",
          message: "Use src/utils/compat.ts",
        },
      ],
    },
  },
  {
    files: ["**/*.{ts,mts,mjs}"],
    languageOptions: {
      sourceType: "module",
    },
  },
  {
    files: ["**/*.{ts,mts}"],
    languageOptions: {
      sourceType: "module",
      parserOptions: {
        project: true,
      },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-var-requires": "off",
      "no-implicit-globals": "off",

      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["/regexpp", "/regexpp/*"],
              message: "Please use `@eslint-community/regexpp` instead.",
            },
            {
              group: ["/eslint-utils", "/eslint-utils/*"],
              message: "Please use `@eslint-community/eslint-utils` instead.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["lib/rules/**"],

    rules: {
      "eslint-plugin/report-message-format": ["error", "[^a-z].*\\.$"],

      "eslint-plugin/require-meta-docs-url": [
        "warn",
        {
          pattern:
            "https://future-architect.github.io/eslint-plugin-vue-scoped-css/rules/{{name}}.html",
        },
      ],

      "eslint-plugin/require-meta-has-suggestions": "off",

      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "default",
          format: ["camelCase"],
          leadingUnderscore: "allow",
          trailingUnderscore: "allow",
        },
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
          trailingUnderscore: "allow",
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
        {
          selector: "property",
          format: null,
        },
        {
          selector: "method",
          format: null,
        },
      ],
    },
  },
  {
    files: ["scripts/*.{js,ts}", "tests/**/*.{js,ts}"],
    rules: {
      "jsdoc/require-jsdoc": "off",
      "no-console": "off",
    },
  },
  ...vueScopedCss.configs["flat/recommended"],
  ...tseslint.config({
    files: ["docs/.vitepress/**/*.{ts,mts,js,mjs,vue}"],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      globals: {
        window: true,
      },
      sourceType: "module",
      parserOptions: {
        project: null,
      },
    },
    rules: {
      "n/no-unsupported-features/node-builtins": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "jsdoc/require-jsdoc": "off",
      "n/no-unsupported-features/es-syntax": "off",
      "n/no-missing-import": "off",
      "n/no-missing-require": "off",
      "n/file-extension-in-import": "off",
      "n/no-extraneous-import": "off",
    },
  }),
];
