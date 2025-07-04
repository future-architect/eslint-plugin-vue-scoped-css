import { RuleTester } from "../test-lib/eslint-compat";
import rule from "../../../lib/rules/v-deep-pseudo-style";

import * as vueParser from "vue-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: vueParser,
    ecmaVersion: 2019,
    sourceType: "module",
  },
});

tester.run("v-deep-pseudo-style", rule as any, {
  valid: [
    `
    <template></template>
    <style scoped>
    .foo :deep(.bar) {}
    </style>
    `,
    {
      code: `
      <template></template>
      <style scoped>
      .foo :deep(.bar) {}
      </style>
      `,
      options: [":deep"],
    },
    {
      code: `
      <template></template>
      <style scoped>
      .foo ::v-deep(.bar) {}
      </style>
      `,
      options: ["::v-deep"],
    },
    `
    <template></template>
    <style scoped>
    .foo ::v-deep .bar {} /* ignore Vue2 style */
    </style>
    `,
  ],
  invalid: [
    {
      code: `
      <template></template>
      <style scoped>
      .foo ::v-deep(.bar) {}
      </style>
      `,
      output: `
      <template></template>
      <style scoped>
      .foo :deep(.bar) {}
      </style>
      `,
      errors: ["Expected ':deep()' instead of '::v-deep()'."],
    },
    {
      code: `
      <template></template>
      <style scoped>
      .foo ::v-deep(.bar) {}
      </style>
      `,
      output: `
      <template></template>
      <style scoped>
      .foo :deep(.bar) {}
      </style>
      `,
      options: [":deep"],
      errors: ["Expected ':deep()' instead of '::v-deep()'."],
    },
    {
      code: `
      <template></template>
      <style scoped>
      .foo :deep(.bar) {}
      </style>
      `,
      output: `
      <template></template>
      <style scoped>
      .foo ::v-deep(.bar) {}
      </style>
      `,
      options: ["::v-deep"],
      errors: ["Expected '::v-deep()' instead of ':deep()'."],
    },
  ],
});
