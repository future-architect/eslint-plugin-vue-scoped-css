import { RuleTester } from "eslint";
import rule = require("../../../lib/rules/no-deprecated-deep-combinator");

const tester = new RuleTester({
  parser: require.resolve("vue-eslint-parser"),
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: "module",
  },
});

tester.run("no-deprecated-deep-combinator", rule as any, {
  valid: [
    `
        <template><div class="item">sample</div></template>
        <style scoped>
        a > .b {}
        a ::v-deep(.b) {}
        a ::v-deep .b {}
        a :deep(.b) {}
        </style>
        `,
  ],
  invalid: [
    {
      code: `
            <template><div class="item">sample</div></template>
            <style scoped>
            a >>> .b {}
            a /deep/ .b {}
            </style>
            `,
      output: `
            <template><div class="item">sample</div></template>
            <style scoped>
            a ::v-deep .b {}
            a ::v-deep .b {}
            </style>
            `,
      errors: [
        {
          message: "The deep combinator `>>>` is deprecated.",
          line: 4,
          column: 15,
          endLine: 4,
          endColumn: 18,
        },
        {
          message: "The deep combinator `/deep/` is deprecated.",
          line: 5,
          column: 15,
          endLine: 5,
          endColumn: 21,
        },
      ],
    },

    {
      code: `
            <template><div class="item">sample</div></template>
            <style scoped>
            a>>>.b {}
            a/deep/.b {}
            </style>
            `,
      output: `
            <template><div class="item">sample</div></template>
            <style scoped>
            a ::v-deep .b {}
            a ::v-deep .b {}
            </style>
            `,
      errors: [
        "The deep combinator `>>>` is deprecated.",
        "The deep combinator `/deep/` is deprecated.",
      ],
    },
  ],
});
