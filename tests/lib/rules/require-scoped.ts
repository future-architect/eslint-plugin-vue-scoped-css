import { RuleTester } from "eslint"
import semver from "semver"
const rule = require("../../../lib/rules/require-scoped")

const parserVersion = require("vue-eslint-parser/package.json").version

const tester = new RuleTester({
    parser: require.resolve("vue-eslint-parser"),
    parserOptions: {
        ecmaVersion: 2019,
        sourceType: "module",
    },
})

tester.run("require-scoped", rule, {
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
    ],
    invalid: [
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
                    // eslint-disable-next-line @mysticatea/ts/ban-ts-ignore, spaced-comment
                    /// @ts-ignore
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
                    // eslint-disable-next-line @mysticatea/ts/ban-ts-ignore, spaced-comment
                    /// @ts-ignore
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
    ],
})
