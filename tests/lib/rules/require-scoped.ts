import { RuleTester } from "eslint"
import semver from "semver"
import rule = require("../../../lib/rules/require-scoped")

const parserVersion = require("vue-eslint-parser/package.json").version

const tester = new RuleTester({
    parser: require.resolve("vue-eslint-parser"),
    parserOptions: {
        ecmaVersion: 2019,
        sourceType: "module",
    },
})

tester.run("require-scoped", rule as any, {
    valid: [
        `
        <template>
        </template>
        <style scoped>
        </style>
        `,
        `
        <template>
        </template>
        `,
        {
            code: `
            <template>
            </template>
            <style>
            </style>
            `,
            options: ["never"],
        },

        // Modern API
        {
            code: `
            <template>
            </template>
            <style>
            </style>
            `,
            options: [
                "error",
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
                "error",
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
                "error",
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
                "error",
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
                "error",
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
                "error",
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
                "error",
                {
                    allows: ["plain", "scoped", "module"],
                },
            ],
        },
    ],
    invalid: [
        // Deprecated API
        {
            code: `
            <template>
            </template>
            <style>
            </style>
            `,
            errors: [
                {
                    messageId: "missing",
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
            <style />
            `,
            errors: [
                {
                    messageId: "missing",
                    line: 4,
                    column: 13,
                    endLine: 4,
                    endColumn: 22,
                    suggestions: [
                        {
                            desc: "Add `scoped` attribute.",
                            output: `
            <template>
            </template>
            <style  scoped/>
            `,
                        },
                    ],
                },
            ],
        },
        ...(semver.satisfies(parserVersion, ">=7.0.0")
            ? [
                  {
                      code: `
                        <script>
                        </script>
                        <style />
                        `,
                      errors: [
                          {
                              messageId: "missing",
                              line: 4,
                              column: 25,
                              endLine: 4,
                              endColumn: 34,
                          },
                      ],
                  },
              ]
            : []),
        {
            code: `
            <template>
            </template>
            <style scoped>
            </style>
            `,
            options: ["never"],
            errors: [
                {
                    messageId: "forbidden",
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
            <style >
            </style>
            `,
                        },
                    ],
                },
            ],
        },

        // Modern API
        {
            code: `
            <template>
            </template>
            <style>
            </style>
            `,
            options: ["error"],
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
                "error",
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
                "error",
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
                "error",
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
                "error",
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
                "error",
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
            <style >
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
                "error",
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
            <style >
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
                "error",
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
                "error",
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
                "error",
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
                },
            ],
        },
    ],
})
