import { RuleTester } from "eslint"
import rule = require("../../lib/rules/no-unused-selector")

const tester = new RuleTester({
    parser: require.resolve("vue-eslint-parser"),
    parserOptions: {
        ecmaVersion: 2019,
        sourceType: "module",
    },
})

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
            /* eslint-disable-next-line no-unused-selector-comment-directives */
            div {
                & > .foo,
                & > li.foo {/* eslint-disable-line no-unused-selector-comment-directives */
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
            /* eslint-disable no-unused-selector-comment-directives */
            div {
                & > .foo,
                /* eslint-enable no-unused-selector-comment-directives */ & > li.foo {
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
})
