import { RuleTester, testRuleIdPrefix } from "./test-lib/eslint-compat";
import rule from "../../lib/rules/no-unused-selector";

import * as vueParser from "vue-eslint-parser";

const testRulePrefix = testRuleIdPrefix;

const tester = new RuleTester({
  languageOptions: {
    parser: vueParser,
    ecmaVersion: 2019,
    sourceType: "module",
  },
});

tester.run("no-unused-selector-comment-directives", rule as any, {
  valid: [],
  invalid: [
    // comment directives
    {
      code: `
            <template>
                <div><ul>
                    <li class="bar"/>
                </ul></div>
            </template>
            <style scoped>
            /* eslint-disable-next-line */
            div {
                & > .foo,
                & > li.foo {/* eslint-disable-line */
                } 
                & > li.bar {}
            }
            </style>
            `,
      errors: [{ messageId: "unused", data: { selector: ".foo" } }],
    },
    {
      code: `
            <template>
                <div><ul>
                    <li class="bar"/>
                </ul></div>
            </template>
            <style scoped>
            /* eslint-disable-next-line -- description */
            div {
                & > .foo,
                & > li.foo {/* eslint-disable-line -- description */
                } 
                & > li.bar {}
            }
            </style>
            `,
      errors: [{ messageId: "unused", data: { selector: ".foo" } }],
    },
    {
      code: `
            <template>
                <div><ul>
                    <li class="bar"/>
                </ul></div>
            </template>
            <style scoped>
            /* eslint-disable-next-line ${testRulePrefix}no-unused-selector-comment-directives */
            div {
                & > .foo,
                & > li.foo {/* eslint-disable-line ${testRulePrefix}no-unused-selector-comment-directives */
                } 
                & > li.bar {}
            }
            </style>
            `,
      errors: [{ messageId: "unused", data: { selector: ".foo" } }],
    },
    {
      code: `
            <template>
                <div><ul>
                    <li class="bar"/>
                </ul></div>
            </template>
            <style scoped>
            /* eslint-disable-next-line foo */
            div {
                & > .foo,
                & > li.foo {/* eslint-disable-line foo */
                } 
                & > li.bar {}
            }
            </style>
            `,
      errors: [
        { messageId: "unused", data: { selector: "div>li.bar" } },
        { messageId: "unused", data: { selector: ".foo" } },
        { messageId: "unused", data: { selector: "li.foo" } },
      ],
    },
    {
      code: `
            <template>
                <div><ul>
                    <li class="bar"/>
                </ul></div>
            </template>
            <style scoped>
            /* eslint-disable */
            div {
                & > .foo,
                /* eslint-enable */ & > li.foo {
                } 
                & > li.bar {}
            }
            </style>
            `,
      errors: [{ messageId: "unused", data: { selector: "li.foo" } }],
    },
    {
      code: `
            <template>
                <div><ul>
                    <li class="bar"/>
                </ul></div>
            </template>
            <style scoped>
            /* eslint-disable ${testRulePrefix}no-unused-selector-comment-directives */
            div {
                & > .foo,
                /* eslint-enable ${testRulePrefix}no-unused-selector-comment-directives */ & > li.foo {
                } 
                & > li.bar {}
            }
            </style>
            `,
      errors: [{ messageId: "unused", data: { selector: "li.foo" } }],
    },
    {
      code: `
            <template>
                <div><ul>
                    <li class="bar"/>
                </ul></div>
            </template>
            <style scoped>
            /* eslint-disable foo */
            div {
                & > .foo,
                & > li.foo {/* eslint-enable foo */
                } 
                & > li.bar {}
            }
            </style>
            `,
      errors: [
        { messageId: "unused", data: { selector: "div>li.bar" } },
        { messageId: "unused", data: { selector: ".foo" } },
        { messageId: "unused", data: { selector: "li.foo" } },
      ],
    },
  ],
});
