import type { ESLint } from "eslint";
import * as vueParser from "vue-eslint-parser";
import plugin from "../../plugin";
export default [
  {
    plugins: {
      // eslint-disable-next-line @typescript-eslint/naming-convention -- plugin name
      "vue-scoped-css": plugin as ESLint.Plugin,
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
