import { RuleTester } from "eslint"
const rule = require("../../../lib/rules/no-parsing-error")

const tester = new RuleTester({
    parser: require.resolve("vue-eslint-parser"),
    parserOptions: {
        ecmaVersion: 2019,
        sourceType: "module",
    },
})

tester.run("no-parsing-error", rule, {
    valid: [
        `
        <style scoped>
        .item {}
        </style>
        `,
    ],
    invalid: [
        {
            code: `
            <style scoped>
            .item {
            </style>
            `,
            errors: [
                {
                    message: "Parsing error: Unclosed block.",
                    line: 3,
                    column: 13,
                },
            ],
        },
    ],
})
