import { RuleTester } from "eslint";
import semver from "semver";
import rule = require("../../../lib/rules/require-scoped");

const parserVersion = require("vue-eslint-parser/package.json").version;

const tester = new RuleTester({
  parser: require.resolve("vue-eslint-parser"),
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: "module",
  },
});

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
  ],
});
