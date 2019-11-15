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
        <template><!-- When using vue-eslint-parser@5, a template tag is required.  --></template>
        <style scoped>
        .item {}
        </style>
        `,
    ],
    invalid: [
        {
            code: `
            <template><!-- When using vue-eslint-parser@5, a template tag is required.  --></template>
            <style scoped>
            .item {
            </style>
            `,
            errors: [
                {
                    message: "Parsing error: Unclosed block.",
                    line: 4,
                    column: 13,
                },
            ],
        },
    ],
})
