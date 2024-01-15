import { RuleTester } from "../test-lib/eslint-compat";
import rule = require("../../../lib/rules/require-v-slotted-argument");

import * as vueParser from "vue-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: vueParser,
    ecmaVersion: 2019,
    sourceType: "module",
  },
});

tester.run("require-v-slotted-argument", rule as any, {
  valid: [
    `
        <template><div class="item">sample</div></template>
        <style scoped>
        .baz .qux ::v-slotted(.foo .bar) {}
        </style>
        `,
  ],
  invalid: [
    {
      code: `
            <template><div class="item">sample</div></template>
            <style scoped>
            .baz .qux ::v-slotted .foo .bar {}
            .baz .qux ::v-slotted() {}
            </style>
            `,
      errors: [
        {
          message: "Need to pass argument to the `::v-slotted` pseudo-element.",
          line: 4,
          column: 23,
          endLine: 4,
          endColumn: 34,
        },
        {
          message: "Need to pass argument to the `::v-slotted` pseudo-element.",
          line: 5,
          column: 23,
          endLine: 5,
          endColumn: 36,
        },
      ],
    },
  ],
});
