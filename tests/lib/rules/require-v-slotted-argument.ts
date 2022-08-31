import { RuleTester } from "eslint";
import rule = require("../../../lib/rules/require-v-slotted-argument");

const tester = new RuleTester({
  parser: require.resolve("vue-eslint-parser"),
  parserOptions: {
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
