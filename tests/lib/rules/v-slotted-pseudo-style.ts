import { RuleTester } from "../test-lib/eslint-compat";
import rule from "../../../lib/rules/v-slotted-pseudo-style";
import * as vueParser from "vue-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: vueParser,
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
