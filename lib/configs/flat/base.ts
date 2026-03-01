import type { ESLint } from "eslint";
import * as vueParser from "vue-eslint-parser";
import * as index from "../../index";
export default [
  {
    plugins: {
      // eslint-disable-next-line @typescript-eslint/naming-convention -- plugin name
      get "vue-scoped-css"(): ESLint.Plugin {
        return index.default as unknown as ESLint.Plugin;
      },
    },
    name: "vue-scoped-css/base/plugins",
  },
  {
    files: ["*.vue", "**/*.vue"],
    languageOptions: {
      parser: vueParser,
    },
    name: "vue-scoped-css/base/options",
  },
];
