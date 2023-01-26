import { RuleTester } from "eslint";
import rule = require("../../../lib/rules/v-deep-pseudo-style");

const tester = new RuleTester({
  parser: require.resolve("vue-eslint-parser"),
  parserOptions: {
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
