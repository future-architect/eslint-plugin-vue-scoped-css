import { RuleTester } from "../test-lib/eslint-compat";
import rule from "../../../lib/rules/no-parent-of-v-global";

import * as vueParser from "vue-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: vueParser,
    ecmaVersion: 2019,
    sourceType: "module",
  },
});

tester.run("no-parent-of-v-global", rule as any, {
  valid: [
    `
        <template><div class="item">sample</div></template>
        <style scoped>
        ::v-global(.foo) {}
        </style>
        `,
  ],
  invalid: [
    {
      code: `
            <template><div class="item">sample</div></template>
            <style scoped>
            .bar ::v-global(.foo) {}
            </style>
            `,
      errors: [
        {
          message:
            "The parent selector of the `::v-global()` pseudo-element is useless.",
          line: 4,
          column: 18,
          endColumn: 34,
        },
      ],
    },
  ],
});
