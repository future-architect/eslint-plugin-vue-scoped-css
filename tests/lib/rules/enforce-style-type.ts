import { RuleTester } from "eslint"
import rule = require("../../../lib/rules/enforce-style-type")

const tester = new RuleTester({
    parser: require.resolve("vue-eslint-parser"),
    parserOptions: {
        ecmaVersion: 2019,
        sourceType: "module",
    },
})

tester.run("enforce-style-type", rule as any, {
    valid: [
        `
        <template>
        </template>
        `,
        `
        <template>
        </template>
        <style scoped>
        </style>
        `,
        {
            code: `
            <template>
            </template>
            <style scoped>
            </style>
            `,
            options: [{}],
        },
        {
            code: `
            <template>
            </template>
            <style>
            </style>
            `,
            options: [
                {
                    allows: ["plain"],
                },
            ],
        },
        {
            code: `
            <template>
            </template>
            <style scoped>
            </style>
            `,
            options: [
                {
                    allows: ["scoped"],
                },
            ],
        },
        {
            code: `
            <template>
            </template>
            <style module>
            </style>
            `,
            options: [
                {
                    allows: ["module"],
                },
            ],
        },
        {
            code: `
            <template>
            </template>
            <style module="$s">
            </style>
            `,
            options: [
                {
                    allows: ["module"],
                },
            ],
        },
        {
            code: `
            <template>
            </template>
            <style>
            </style>
            `,
            options: [
                {
                    allows: ["plain", "scoped", "module"],
                },
            ],
        },
        {
            code: `
            <template>
            </template>
            <style scoped>
            </style>
            `,
            options: [
                {
                    allows: ["plain", "scoped", "module"],
                },
            ],
        },
        {
            code: `
            <template>
            </template>
            <style module>
            </style>
            `,
            options: [
                {
                    allows: ["plain", "scoped", "module"],
                },
            ],
        },
    ],
    invalid: [
        {
            code: `
            <template>
            </template>
            <style>
            </style>
            `,
            options: [{}],
            errors: [
                {
                    messageId: "forbiddenPlain",
                    line: 4,
                    column: 13,
                    endLine: 4,
                    endColumn: 20,
                    suggestions: [
                        {
                            desc: "Add `scoped` attribute.",
                            output: `
            <template>
            </template>
            <style scoped>
            </style>
            `,
                        },
                    ],
                },
            ],
        },
        {
            code: `
            <template>
            </template>
            <style>
            </style>
            `,
            options: [
                {
                    allows: ["scoped"],
                },
            ],
            errors: [
                {
                    messageId: "forbiddenPlain",
                    line: 4,
                    column: 13,
                    endLine: 4,
                    endColumn: 20,
                    suggestions: [
                        {
                            desc: "Add `scoped` attribute.",
                            output: `
            <template>
            </template>
            <style scoped>
            </style>
            `,
                        },
                    ],
                },
            ],
        },
        {
            code: `
            <template>
            </template>
            <style module>
            </style>
            `,
            options: [
                {
                    allows: ["scoped"],
                },
            ],
            errors: [
                {
                    messageId: "forbiddenStyle",
                    line: 4,
                    column: 20,
                    endLine: 4,
                    endColumn: 26,
                    suggestions: [
                        {
                            messageId: "change",
                            output: `
            <template>
            </template>
            <style scoped>
            </style>
            `,
                        },
                    ],
                },
            ],
        },
        {
            code: `
            <template>
            </template>
            <style>
            </style>
            `,
            options: [
                {
                    allows: ["module"],
                },
            ],
            errors: [
                {
                    messageId: "forbiddenPlain",
                    line: 4,
                    column: 13,
                    endLine: 4,
                    endColumn: 20,
                    suggestions: [
                        {
                            desc: "Add `module` attribute.",
                            output: `
            <template>
            </template>
            <style module>
            </style>
            `,
                        },
                    ],
                },
            ],
        },
        {
            code: `
            <template>
            </template>
            <style scoped>
            </style>
            `,
            options: [
                {
                    allows: ["module"],
                },
            ],
            errors: [
                {
                    messageId: "forbiddenStyle",
                    line: 4,
                    column: 20,
                    endLine: 4,
                    endColumn: 26,
                    suggestions: [
                        {
                            desc: "Change `scoped` to `module` attribute.",
                            output: `
            <template>
            </template>
            <style module>
            </style>
            `,
                        },
                    ],
                },
            ],
        },
        {
            code: `
            <template>
            </template>
            <style scoped>
            </style>
            `,
            options: [
                {
                    allows: ["plain"],
                },
            ],
            errors: [
                {
                    messageId: "forbiddenStyle",
                    line: 4,
                    column: 20,
                    endLine: 4,
                    endColumn: 26,
                    suggestions: [
                        {
                            desc: "Remove `scoped` attribute.",
                            output: `
            <template>
            </template>
            <style>
            </style>
            `,
                        },
                    ],
                },
            ],
        },
        {
            code: `
            <template>
            </template>
            <style module>
            </style>
            `,
            options: [
                {
                    allows: ["plain"],
                },
            ],
            errors: [
                {
                    messageId: "forbiddenStyle",
                    line: 4,
                    column: 20,
                    endLine: 4,
                    endColumn: 26,
                    suggestions: [
                        {
                            desc: "Remove `module` attribute.",
                            output: `
            <template>
            </template>
            <style>
            </style>
            `,
                        },
                    ],
                },
            ],
        },
        {
            code: `
            <template>
            </template>
            <style>
            </style>
            `,
            options: [
                {
                    allows: ["scoped", "module"],
                },
            ],
            errors: [
                {
                    messageId: "forbiddenPlain",
                    line: 4,
                    column: 13,
                    endLine: 4,
                    endColumn: 20,
                    suggestions: [],
                },
            ],
        },
        {
            code: `
            <template>
            </template>
            <style module>
            </style>
            `,
            options: [
                {
                    allows: ["plain", "scoped"],
                },
            ],
            errors: [
                {
                    messageId: "forbiddenStyle",
                    line: 4,
                    column: 20,
                    endLine: 4,
                    endColumn: 26,
                    suggestions: [
                        {
                            desc: "Remove `module` attribute.",
                            output: `
            <template>
            </template>
            <style>
            </style>
            `,
                        },
                    ],
                },
            ],
        },
        {
            code: `
            <template>
            </template>
            <style scoped>
            </style>
            `,
            options: [
                {
                    allows: ["plain", "module"],
                },
            ],
            errors: [
                {
                    messageId: "forbiddenStyle",
                    line: 4,
                    column: 20,
                    endLine: 4,
                    endColumn: 26,
                    suggestions: [
                        {
                            desc: "Remove `scoped` attribute.",
                            output: `
            <template>
            </template>
            <style>
            </style>
            `,
                        },
                    ],
                },
            ],
        },
        {
            code: `
            <template>
            </template>
            <style scoped module>
            </style>
            `,
            errors: [
                {
                    messageId: "forbiddenScopedModule",
                    line: 4,
                    column: 13,
                    endLine: 4,
                    endColumn: 34,
                    suggestions: [
                        {
                            desc: "Remove attributes `module`.",
                            output: `
            <template>
            </template>
            <style scoped>
            </style>
            `,
                        },
                    ],
                },
            ],
        },
        {
            code: `
            <template>
            </template>
            <style scoped module>
            </style>
            `,
            options: [
                {
                    allows: ["module"],
                },
            ],
            errors: [
                {
                    messageId: "forbiddenScopedModule",
                    line: 4,
                    column: 13,
                    endLine: 4,
                    endColumn: 34,
                    suggestions: [
                        {
                            desc: "Remove attributes `scoped`.",
                            output: `
            <template>
            </template>
            <style module>
            </style>
            `,
                        },
                    ],
                },
            ],
        },
        {
            code: `
            <template>
            </template>
            <style scoped module random-attr>
            </style>
            `,
            options: [
                {
                    allows: ["plain"],
                },
            ],
            errors: [
                {
                    messageId: "forbiddenScopedModule",
                    line: 4,
                    column: 13,
                    endLine: 4,
                    endColumn: 46,
                    suggestions: [
                        {
                            desc: "Remove attributes `scoped`, `module`.",
                            output: `
            <template>
            </template>
            <style random-attr>
            </style>
            `,
                        },
                    ],
                },
            ],
        },
    ],
})
