import { RuleTester } from "eslint"
import semver from "semver"
const rule = require("../../../lib/rules/no-parsing-error")
const parserVersion = require("vue-eslint-parser/package.json").version

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
        `
        <template></template>
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
        ...(semver.satisfies(parserVersion, ">=7.0.0")
            ? [
                  {
                      code: `
            <style scoped>
            .item {
            `,
                      errors: [
                          {
                              message: "Parsing error: Missing end tag.",
                              line: 2,
                              column: 27,
                          },
                      ],
                  },
                  {
                      code: `
            <style scoped>
            .item {
            </style>
            <doc></doc`,
                      errors: [
                          {
                              message: "Parsing error: eof-in-tag.",
                              line: 5,
                              column: 23,
                          },
                      ],
                  },
              ]
            : []),
    ],
})
