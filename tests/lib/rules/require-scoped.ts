import { RuleTester } from "eslint"
const rule = require("../../../lib/rules/require-scoped")

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
                },
            ],
        },
    ],
})
