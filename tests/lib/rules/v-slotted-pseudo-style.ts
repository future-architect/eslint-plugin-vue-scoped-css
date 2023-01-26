import { RuleTester } from "eslint";
import rule = require("../../../lib/rules/v-slotted-pseudo-style");

const tester = new RuleTester({
  parser: require.resolve("vue-eslint-parser"),
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: "module",
  },
});

tester.run("v-slotted-pseudo-style", rule as any, {
  valid: [
    `
    <template></template>
    <style scoped>
    .foo :slotted(.bar) {}
    </style>
    `,
    {
      code: `
      <template></template>
      <style scoped>
      .foo :slotted(.bar) {}
      </style>
      `,
      options: [":slotted"],
    },
    {
      code: `
      <template></template>
      <style scoped>
      .foo ::v-slotted(.bar) {}
      </style>
      `,
      options: ["::v-slotted"],
    },
    `
    <template></template>
    <style scoped>
    .foo ::v-slotted .bar {} /* ignore Vue2 style */
    </style>
    `,
  ],
  invalid: [
    {
      code: `
      <template></template>
      <style scoped>
      .foo ::v-slotted(.bar) {}
      </style>
      `,
      output: `
      <template></template>
      <style scoped>
      .foo :slotted(.bar) {}
      </style>
      `,
      errors: ["Expected ':slotted()' instead of '::v-slotted()'."],
    },
    {
      code: `
      <template></template>
      <style scoped>
      .foo ::v-slotted(.bar) {}
      </style>
      `,
      output: `
      <template></template>
      <style scoped>
      .foo :slotted(.bar) {}
      </style>
      `,
      options: [":slotted"],
      errors: ["Expected ':slotted()' instead of '::v-slotted()'."],
    },
    {
      code: `
      <template></template>
      <style scoped>
      .foo :slotted(.bar) {}
      </style>
      `,
      output: `
      <template></template>
      <style scoped>
      .foo ::v-slotted(.bar) {}
      </style>
      `,
      options: ["::v-slotted"],
      errors: ["Expected '::v-slotted()' instead of ':slotted()'."],
    },
  ],
});
