import { RuleTester } from "../test-lib/eslint-compat";
import rule = require("../../../lib/rules/require-v-global-argument");

import * as vueParser from "vue-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: vueParser,
    ecmaVersion: 2019,
    sourceType: "module",
  },
});

tester.run("require-v-global-argument", rule as any, {
  valid: [
    `
        <template><div class="item">sample</div></template>
        <style scoped>
        ::v-global(.foo .bar) {}
        </style>
        `,
  ],
  invalid: [
    {
      code: `
            <template><div class="item">sample</div></template>
            <style scoped>
            ::v-global {}
            ::v-global() {}
            </style>
            `,
      errors: [
        {
          message: "Need to pass argument to the `::v-global` pseudo-element.",
          line: 4,
          column: 13,
          endLine: 4,
          endColumn: 23,
        },
        {
          message: "Need to pass argument to the `::v-global` pseudo-element.",
          line: 5,
          column: 13,
          endLine: 5,
          endColumn: 25,
        },
      ],
    },
  ],
});
