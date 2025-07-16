import { RuleTester } from "./test-lib/eslint-compat";
import rule from "../../lib/rules/no-parsing-error";

import * as vueParser from "vue-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: vueParser,
    ecmaVersion: 2019,
    sourceType: "module",
  },
});

// Test for the fix of "Invalid column number (column -1 requested)" error
tester.run("no-parsing-error-with-comment-directives", rule as any, {
  valid: [
    // Test that eslint-disable-line comments don't cause parsing errors
    {
      code: `
            <template>
                <div class="test"></div>
            </template>
            <style scoped>
            .test {
                color: red; /* eslint-disable-line */
            }
            </style>
            `,
    },
    // Test that eslint-disable-next-line comments don't cause parsing errors
    {
      code: `
            <template>
                <div class="test"></div>
            </template>
            <style scoped>
            /* eslint-disable-next-line */
            .test {
                color: red;
            }
            </style>
            `,
    },
    // Test with multiple comment directives
    {
      code: `
            <template>
                <div class="test"></div>
            </template>
            <style scoped>
            /* eslint-disable */
            .test {
                color: red; /* eslint-disable-line */
            }
            /* eslint-enable */
            </style>
            `,
    },
    // Test with rule-specific directives
    {
      code: `
            <template>
                <div class="test"></div>
            </template>
            <style scoped>
            .test {
                color: red; /* eslint-disable-line vue-scoped-css/no-unused-selector */
            }
            /* eslint-disable-next-line vue-scoped-css/no-unused-selector */
            .unused {
                color: blue;
            }
            </style>
            `,
    },
  ],
  invalid: [],
});