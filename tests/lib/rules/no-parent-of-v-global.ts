import { RuleTester } from "eslint"
import rule = require("../../../lib/rules/no-parent-of-v-global")

const tester = new RuleTester({
    parser: require.resolve("vue-eslint-parser"),
    parserOptions: {
        ecmaVersion: 2019,
        sourceType: "module",
    },
})

tester.run("no-parent-of-v-global", rule as any, {
    valid: [
        `
        <template><div class="item">sample</div></template>
        <style scoped>
        ::v-global(.foo) {}
        </style>
        `,
    ],
    invalid: [
        {
            code: `
            <template><div class="item">sample</div></template>
            <style scoped>
            .bar ::v-global(.foo) {}
            </style>
            `,
            errors: [
                {
                    message:
                        "The parent selector of the `::v-global()` pseudo-element is useless.",
                    line: 4,
                    column: 18,
                    endColumn: 34,
                },
            ],
        },
    ],
})
