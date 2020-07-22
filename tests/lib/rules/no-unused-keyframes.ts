import { RuleTester } from "eslint"
import rule = require("../../../lib/rules/no-unused-keyframes")

const tester = new RuleTester({
    parser: require.resolve("vue-eslint-parser"),
    parserOptions: {
        ecmaVersion: 2019,
        sourceType: "module",
    },
})

tester.run("no-unused-keyframes", rule as any, {
    valid: [
        `
        <template><!-- When using vue-eslint-parser@5, a template tag is required.  --></template>
        <style scoped>
        .item {
            animation-name: slidein;
        }
        @keyframes slidein {
        }
        </style>
        `,
        `
        <template><!-- When using vue-eslint-parser@5, a template tag is required.  --></template>
        <style scoped>
        .item {
            animation: 3s ease-in 1s infinite reverse both running slidein;
        }
        @keyframes slidein {
        }
        </style>
        `,
        `
        <template><!-- When using vue-eslint-parser@5, a template tag is required.  --></template>
        <style scoped lang="scss">
        .item {
            animation-name: slidein;
        }
        @mixin keyframes($animation-name) {
            @-webkit-keyframes #{$animation-name} {
                @content;
            }
            @-moz-keyframes #{$animation-name} {
                @content;
            }  
            @keyframes #{$animation-name} {
                @content;
            }
        }
        </style>
        `,
        `
        <template><!-- When using vue-eslint-parser@5, a template tag is required.  --></template>
        <style scoped lang="stylus">
        .item
            animation-name: slidein;

        keyframes($animation-name) {
            @-webkit-keyframes {$animation-name} {
                @content;
            }
            @-moz-keyframes {$animation-name} {
                @content;
            }  
            @keyframes {$animation-name} {
                @content;
            }
        }
        </style>
        `,
        `
        <template><!-- When using vue-eslint-parser@5, a template tag is required.  --></template>
        <style scoped lang="scss">
        .item {
            animation-name: $any;
        }
        @keyframes slidein {
        }
        </style>
        `,
        `
        <template><!-- When using vue-eslint-parser@5, a template tag is required.  --></template>
        <style scoped lang="stylus">
        .item
            animation-name: $any;
        @keyframes slidein {
        }
        </style>
        `,
        `
        <template><!-- When using vue-eslint-parser@5, a template tag is required.  --></template>
        <style scoped lang="stylus">
        .item
            animation-name: slide + arg;
        @keyframes slidein {
        }
        </style>
        `,
        `
        <template><!-- When using vue-eslint-parser@5, a template tag is required.  --></template>
        <style scoped lang="scss">
        .item {
            animation-name: slide#{$arg};
        }
        @keyframes slidein {
        }
        @keyframes slideout {
        }
        </style>
        `,
    ],
    invalid: [
        {
            code: `
            <template><!-- When using vue-eslint-parser@5, a template tag is required.  --></template>
            <style scoped>
            .item {
                animation-name: slidein;
            }
            @keyframes unused {
            }
            </style>
            `,
            errors: [
                {
                    messageId: "unused",
                    data: { params: "unused" },
                    line: 7,
                    column: 24,
                    endLine: 7,
                    endColumn: 30,
                },
            ],
        },
        {
            code: `
            <template><!-- When using vue-eslint-parser@5, a template tag is required.  --></template>
            <style scoped lang="scss">
            .item {
                animation-name: slide#{$arg};
            }
            @keyframes fadein {
            }
            </style>
            `,
            errors: [
                {
                    messageId: "unused",
                    data: { params: "fadein" },
                    line: 7,
                    column: 24,
                    endLine: 7,
                    endColumn: 30,
                },
            ],
        },
        {
            code: `
            <template><!-- When using vue-eslint-parser@5, a template tag is required.  --></template>
            <style scoped lang="stylus">
            .item
                animation-name slidein

            @keyframes fadein {
            }
            </style>
            `,
            errors: [
                {
                    messageId: "unused",
                    data: { params: "fadein" },
                    line: 7,
                    column: 24,
                    endLine: 7,
                    endColumn: 30,
                },
            ],
        },
    ],
})
