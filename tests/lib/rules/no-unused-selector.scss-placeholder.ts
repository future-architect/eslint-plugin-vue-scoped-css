import { RuleTester } from "eslint";
import rule from "../../../lib/rules/no-unused-selector.ts";

import * as vueParser from "vue-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: vueParser,
    ecmaVersion: 2019,
    sourceType: "module",
  },
});

tester.run("no-unused-selector SCSS placeholders", rule as any, {
  valid: [],
  invalid: [
    {
      code: `<template>
  <h1 class="eng-title">hello</h1>
</template>
<style scoped lang="scss">
%title, .x {
  font-size: 2rem;
}

.eng-title {
  @extend %title;
}
</style>`,
      errors: [
        {
          messageId: "unused",
          data: { selector: ".x" },
        },
      ],
    },
  ],
});
