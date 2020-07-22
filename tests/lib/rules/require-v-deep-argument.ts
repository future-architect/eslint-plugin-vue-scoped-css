import { RuleTester } from "eslint"
import rule = require("../../../lib/rules/require-v-deep-argument")

const tester = new RuleTester({
    parser: require.resolve("vue-eslint-parser"),
    parserOptions: {
        ecmaVersion: 2019,
        sourceType: "module",
    },
})

tester.run("require-v-deep-argument", rule as any, {
    valid: [
        `
        <template><div class="item">sample</div></template>
        <style scoped>
        .baz .qux ::v-deep(.foo .bar) {}
        </style>
        `,
    ],
    invalid: [
        {
            code: `
            <template><div class="item">sample</div></template>
            <style scoped>
            .baz .qux ::v-deep .foo .bar {}
            .baz .qux ::v-deep() .foo .bar {}
            </style>
            `,
            output: `
            <template><div class="item">sample</div></template>
            <style scoped>
            .baz .qux ::v-deep(.foo .bar) {}
            .baz .qux ::v-deep() .foo .bar {}
            </style>
            `,
            errors: [
                {
                    message:
                        "Need to pass argument to the `::v-deep` pseudo-element.",
                    line: 4,
                    column: 23,
                    endLine: 4,
                    endColumn: 31,
                },
                {
                    message:
                        "Need to pass argument to the `::v-deep` pseudo-element.",
                    line: 5,
                    column: 23,
                    endLine: 5,
                    endColumn: 33,
                },
            ],
        },
    ],
})
