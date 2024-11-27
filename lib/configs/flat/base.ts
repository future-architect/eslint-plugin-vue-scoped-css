import type { ESLint } from "eslint";
import * as vueParser from "vue-eslint-parser";
export default [
  {
    plugins: {
      // eslint-disable-next-line @typescript-eslint/naming-convention -- plugin name
      get "vue-scoped-css"(): ESLint.Plugin {
        return require("../../index");
      },
    },
    name: "vue-scoped-css/flat/base/plugins",
  },
  {
    files: ["*.vue", "**/*.vue"],
    languageOptions: {
      parser: vueParser,
    },
    name: "vue-scoped-css/flat/base/options",
  },
];
