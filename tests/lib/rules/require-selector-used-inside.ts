import { RuleTester } from "eslint"
const rule = require("../../../lib/rules/require-selector-used-inside")

const tester = new RuleTester({
    parser: require.resolve("vue-eslint-parser"),
    parserOptions: {
        ecmaVersion: 2019,
        sourceType: "module",
    },
})

tester.run("require-selector-used-inside", rule, {
    valid: [
        `
        <template>
            <div><div class="foo"/></div>
        </template>
        <style scoped>
        .foo {}
        div {}
        </style>
        `,
        `
        <template>
            <div><div class="foo"/></div>
        </template>
        <style scoped>
        .foo, div {}
        </style>
        `,
        `
        <template>
            <div><div class="foo"><div id="bar"></div></div></div>
        </template>
        <style scoped>
        div.foo /* comment */ #bar {}
        </style>
        `,
        `
        <template>
            <div><div>
                <li class="foo"/>
            </div></div>
        </template>
        <style scoped>
        div > .foo {}
        </style>
        `,
        // nesting
        `
        <template>
            <div>
                <div>
                    <li class="foo"/>
                </div>
            </div>
        </template>
        <style scoped>
        div { & > .foo {} }
        </style>
        `,
        `
        <template>
            <div class="foo">
                <ul>
                    <li class="bar foo-baz"/>
                </ul>
            </div>
        </template>
        <style scoped>
        .foo { @nest .bar&-baz {} }
        </style>
        `,
        // expressions
        `
        <template>
            <div><div :class="'foo bar'"/></div>
        </template>
        <style scoped>
        .bar {}
        </style>
        `,
        `
        <template>
            <div><div :class="['foo bar']"/></div>
        </template>
        <style scoped>
        .bar {}
        </style>
        `,
        `
        <template>
            <div><div :class="['foo', 'bar']"/></div>
        </template>
        <style scoped>
        .bar {}
        </style>
        `,
        `
        <template>
            <div><div :class="{foo, bar: b}"/></div>
        </template>
        <style scoped>
        .bar {}
        </style>
        `,
        `
        <template>
            <div><div :class="{'foo': f, 'bar': b}"/></div>
        </template>
        <style scoped>
        .bar {}
        </style>
        `,
        // identifier
        // data
        `
        <template>
            <div><div :class="classes"/></div>
        </template>
        <style scoped>
        .foo {}
        </style>
        <script>
        export default {
            data () {
                return {
                    classes: 'foo'
                }
            }
        }
        </script>
        `,
        // computed
        `
        <template>
            <div><div :class="classes"/></div>
        </template>
        <style scoped>
        .foo {}
        </style>
        <script>
        export default {
            computed: {
                classes () {
                    return 'foo'
                }
            }
        }
        </script>
        `,
        // unknown
        // complex script
        `
        <template>
            <div><div :class="data.classes"/></div>
        </template>
        <style scoped>
        .foo {}
        </style>
        `,
        // complex selector
        `
        <template>
            <div><div class="b"/></div>
        </template>
        <style scoped>
        :not(.a) {}
        </style>
        `,
        // options
        // ignoreBEMModifier
        {
            code: `
            <template>
                <div class="foo"/>
            </template>
            <style scoped>
            .foo--bar {}
            </style>
            `,
            options: [{ ignoreBEMModifier: true }],
        },
        // ignore nodes
        `
        <template>
            <div><div :class="data.classes"/></div>
        </template>
        <style scoped>
        @keyframes ani {
            0% { }
            100% { }
        }
        </style>
        `,
        // not scoped
        `
        <template>
            <div></div>
        </template>
        <style>
        input {}
        </style>
        `,
    ],
    invalid: [
        {
            code: `
            <template>
                <li class="bar"/>
            </template>
            <style scoped>
            .foo {}
            div {}
            </style>
            `,
            errors: [
                {
                    messageId: "unused",
                    data: { selector: ".foo" },
                    line: 6,
                    column: 13,
                    endLine: 6,
                    endColumn: 17,
                },
                {
                    messageId: "unused",
                    data: { selector: "div" },
                    line: 7,
                    column: 13,
                    endLine: 7,
                    endColumn: 16,
                },
            ],
        },
        {
            code: `
            <template>
                <li class="bar"/>
            </template>
            <style scoped>
            .foo, /* comment */ div {}
            </style>
            `,
            errors: [
                {
                    messageId: "unused",
                    data: { selector: ".foo" },
                    line: 6,
                    column: 13,
                    endLine: 6,
                    endColumn: 17,
                },
                {
                    messageId: "unused",
                    data: { selector: "div" },
                    line: 6,
                    column: 33,
                    endLine: 6,
                    endColumn: 36,
                },
            ],
        },
        {
            code: `
            <template>
                <div><ul>
                    <li class="bar"/>
                </ul></div>
            </template>
            <style scoped>
            div > .foo,
            div > li.foo {}
            div > li.bar {}
            </style>
            `,
            errors: [
                {
                    messageId: "unused",
                    data: { selector: "div>.foo" },
                    line: 8,
                    column: 13,
                    endLine: 8,
                    endColumn: 23,
                },
                {
                    messageId: "unused",
                    data: { selector: "div>li" },
                    line: 9,
                    column: 13,
                    endLine: 9,
                    endColumn: 21,
                },
                {
                    messageId: "unused",
                    data: { selector: "div>li" },
                    line: 10,
                    column: 13,
                    endLine: 10,
                    endColumn: 21,
                },
            ],
        },
        {
            code: `
            <template>
                <div class="foo"/>
            </template>
            <style scoped>
            .foo.bar {}
            </style>
            `,
            errors: [
                {
                    messageId: "unused",
                    data: { selector: ".foo.bar" },
                    line: 6,
                    column: 13,
                    endLine: 6,
                    endColumn: 21,
                },
            ],
        },
        {
            code: `
            <template>
                <div><ul>
                    <li class="bar"/>
                </ul></div>
            </template>
            <style scoped>
            div {
                & > .foo,
                & > li.foo {}
                & > li.bar {}
            }
            </style>
            `,
            errors: [
                {
                    messageId: "unused",
                    data: { selector: "div>.foo" },
                    line: 8,
                    column: 13,
                    endLine: 9,
                    endColumn: 25,
                },
                {
                    messageId: "unused",
                    data: { selector: "div>li" },
                    line: 8,
                    column: 13,
                    endLine: 10,
                    endColumn: 23,
                },
                {
                    messageId: "unused",
                    data: { selector: "div>li" },
                    line: 8,
                    column: 13,
                    endLine: 11,
                    endColumn: 23,
                },
            ],
        },
        {
            code: `
            <template>
                <div class="foo">
                    <ul>
                        <li class="bar"/>
                    </ul>
                </div>
            </template>
            <style scoped>
            .foo { @nest .bar&-baz {} }
            </style>
            `,
            errors: [
                {
                    messageId: "unused",
                    data: { selector: ".bar.foo-baz" },
                    line: 10,
                    column: 26,
                    endLine: 10,
                    endColumn: 35,
                },
            ],
        },
        {
            code: `
            <template>
                <div>
                    <div class="a"></div>
                </div>
            </template>
            <style scoped>
            div > div.b:not(.a) {
            }
            </style>
            `,
            errors: [
                {
                    messageId: "unused",
                    data: { selector: "div>div.b" },
                    line: 8,
                    column: 13,
                    endLine: 8,
                    endColumn: 24,
                },
            ],
        },
        // options
        // ignoreBEMModifier
        {
            code: `
            <template>
                <div>
                    <div class="foo"/>
                </div>
            </template>
            <style scoped>
            .foo--bar--baz {}
            </style>
            `,
            options: [{ ignoreBEMModifier: true }],
            errors: [
                {
                    messageId: "unused",
                    data: { selector: ".foo--bar--baz" },
                    line: 8,
                    column: 13,
                    endLine: 8,
                    endColumn: 27,
                },
            ],
        },
        // deep
        {
            code: `
            <template>
                <div>
                    <ul class="list">
                        <slot/>
                    </ul>
                </div>
            </template>
            <style scoped>
            div > ul >>> .a {}
            div > li >>> .a {}
            div > .list >>> .a {}
            div > .item >>> .a {}
            </style>
            `,
            errors: [
                {
                    messageId: "unused",
                    data: { selector: "div>li" },
                    line: 11,
                    column: 13,
                    endLine: 11,
                    endColumn: 21,
                },
                {
                    messageId: "unused",
                    data: { selector: "div>.item" },
                    line: 13,
                    column: 13,
                    endLine: 13,
                    endColumn: 24,
                },
            ],
        },
        {
            code: `
            <template>
                <div>
                    <ul class="list">
                        <slot/>
                    </ul>
                </div>
            </template>
            <style scoped>
            div > ul /deep/ .a {}
            div > li /deep/ .a {}
            div > .list /deep/ .a {}
            div > .item /deep/ .a {}
            </style>
            `,
            errors: [
                {
                    messageId: "unused",
                    data: { selector: "div>li" },
                    line: 11,
                    column: 13,
                    endLine: 11,
                    endColumn: 21,
                },
                {
                    messageId: "unused",
                    data: { selector: "div>.item" },
                    line: 13,
                    column: 13,
                    endLine: 13,
                    endColumn: 24,
                },
            ],
        },
        {
            code: `
            <template>
                <div>
                    <ul class="list">
                        <slot/>
                    </ul>
                </div>
            </template>
            <style scoped>
            div > ul ::v-deep .a {}
            div > li ::v-deep .a {}
            div > .list ::v-deep .a {}
            div > .item ::v-deep .a {}
            </style>
            `,
            errors: [
                {
                    messageId: "unused",
                    data: { selector: "div>li" },
                    line: 11,
                    column: 13,
                    endLine: 11,
                    endColumn: 21,
                },
                {
                    messageId: "unused",
                    data: { selector: "div>.item" },
                    line: 13,
                    column: 13,
                    endLine: 13,
                    endColumn: 24,
                },
            ],
        },

        // multiple parents children
        {
            code: `
            <template>
                <div>
                    <div class="foo">
                        <input class="baz">
                    </div>
                    <div class="bar">
                        <input class="baz">
                    </div>
                </div>
            </template>
            <style scoped>
            .foo,
            .bar {
                & > .baz {}
            }
            .foo,
            .bar {
                & > .unknown {}
            }
            </style>
            `,
            errors: [
                {
                    messageId: "unused",
                    data: { selector: ".foo>.unknown" },
                    line: 17,
                    column: 13,
                    endLine: 19,
                    endColumn: 29,
                },
            ],
        },
    ],
})
