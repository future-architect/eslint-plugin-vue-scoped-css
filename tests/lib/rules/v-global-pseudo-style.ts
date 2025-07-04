import { RuleTester } from "../test-lib/eslint-compat";
import rule from "../../../lib/rules/v-global-pseudo-style";

import * as vueParser from "vue-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: vueParser,
    ecmaVersion: 2019,
    sourceType: "module",
  },
});

tester.run("v-global-pseudo-style", rule as any, {
  valid: [
    `
    <template></template>
    <style scoped>
    .foo :global(.bar) {}
    </style>
    `,
    {
      code: `
      <template></template>
      <style scoped>
      .foo :global(.bar) {}
      </style>
      `,
      options: [":global"],
    },
    {
      code: `
      <template></template>
      <style scoped>
      .foo ::v-global(.bar) {}
      </style>
      `,
      options: ["::v-global"],
    },
    `
    <template></template>
    <style scoped>
    .foo ::v-global .bar {} /* ignore Vue2 style */
    </style>
    `,
  ],
  invalid: [
    {
      code: `
      <template></template>
      <style scoped>
      .foo ::v-global(.bar) {}
      </style>
      `,
      output: `
      <template></template>
      <style scoped>
      .foo :global(.bar) {}
      </style>
      `,
      errors: ["Expected ':global()' instead of '::v-global()'."],
    },
    {
      code: `
      <template></template>
      <style scoped>
      .foo ::v-global(.bar) {}
      </style>
      `,
      output: `
      <template></template>
      <style scoped>
      .foo :global(.bar) {}
      </style>
      `,
      options: [":global"],
      errors: ["Expected ':global()' instead of '::v-global()'."],
    },
    {
      code: `
      <template></template>
      <style scoped>
      .foo :global(.bar) {}
      </style>
      `,
      output: `
      <template></template>
      <style scoped>
      .foo ::v-global(.bar) {}
      </style>
      `,
      options: ["::v-global"],
      errors: ["Expected '::v-global()' instead of ':global()'."],
    },
  ],
});
