import { RuleTester } from "eslint";
import rule = require("../../../lib/rules/no-deprecated-v-enter-v-leave-class");

const tester = new RuleTester({
  parser: require.resolve("vue-eslint-parser"),
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: "module",
  },
});

tester.run("no-deprecated-v-enter-v-leave-class", rule as any, {
  valid: [
    `
        <template>
            <Transition><div v-if="foo"/></Transition>
        </template>
        <style scoped>
        .v-enter-from {}
        .v-leave-from {}
        </style>
        `,
    `
        <template>
            <Transition><div v-if="foo"/></Transition>
        </template>
        <style scoped>
        .v-enter, .v-enter-from {}
        .v-leave, .v-leave-from {}
        </style>
        `,
    `
        <template>
            <Transition
              enter-from-class="foo"
              leave-from-class="bar">
              <div v-if="foo"/>
            </Transition>
        </template>
        <style scoped>
        .foo {}
        .bar {}
        </style>
        `,
    `
        <template>
            <Transition
              enter-from-class="foo"
              enter-class="foo"
              leave-class="bar"
              leave-from-class="bar">
              <div v-if="foo"/>
            </Transition>
        </template>
        <style scoped>
        .foo {}
        .bar {}
        </style>
        `,
    `
        <template>
            <Transition name="xx"><div v-if="foo"/></Transition>
        </template>
        <style scoped>
        .xx-enter, .xx-enter-from {}
        .xx-leave, .xx-leave-from {}
        </style>
        `,
    `
        <template>
            <Transition><div v-if="foo"/></Transition>
            <Transition name="xx"><div v-if="foo"/></Transition>
        </template>
        <style scoped>
        .foo ::v-deep(.v-enter) { .v-enter {} }
        .foo ::v-deep(.v-leave) { .v-enter {} }
        .foo ::v-deep(.xx-enter) { .v-enter {} }
        .foo ::v-deep(.xx-leave) { .v-enter {} }
        </style>
        `,
    `
        <template>
            <Transition><div v-if="foo"/></Transition>
        </template>
        <style scoped>
        .foo {
          @nest & ::v-deep(.v-enter) { .v-enter {} }
          @nest & ::v-deep(.v-leave) { .v-enter {} }
        }
        </style>
        `,
    `
        <template>
            <Transition :name="name"><div v-if="foo"/></Transition>
        </template>
        <script>
        export default {
            computed: { }
        }
        </script>
        <style scoped>
        .xx-enter {}
        .xx-leave {}
        </style>
        `,
    `
        <template>
            <Transition :name="name"><div v-if="foo"/></Transition>
        </template>
        <script>
        export default {
            computed: {
                name () { return xx }
            }
        }
        </script>
        <style scoped>
        .xx-enter {}
        .xx-leave {}
        </style>
        `,
    `
        <template>
            <Transition><div v-if="foo"/></Transition>
        </template>
        <style scoped>
        @keyframes ignore-keyframes {
        .v-enter {}
        .v-leave {}
        }
        </style>
        `,
    `
        <template>
            <Transition><div v-if="foo"/></Transition>
        </template>
        <style>
        .v-enter {}
        .v-leave {}
        </style>
        `,
    `
        <template>
            <Transition :name="name"><div v-if="foo"/></Transition>
        </template>
        <script>
        export default {
            computed: {
                name () { return 'y' + x }
            }
        }
        </script>
        <style scoped>
        .xx-enter {}
        .xx-leave {}
        </style>
        `,
  ],
  invalid: [
    {
      code: `
            <template>
                <Transition><div v-if="foo"/></Transition>
            </template>
            <style scoped>
            .v-enter {}
            .v-leave {}
            </style>
            `,
      errors: [
        {
          message: "The `v-enter` class is renamed in Vue 3.",
          line: 6,
          column: 13,
        },
        {
          message: "The `v-leave` class is renamed in Vue 3.",
          line: 7,
          column: 13,
        },
      ],
    },
    {
      code: `
            <template>
                <Transition
                  enter-class="foo"
                  leave-class="bar">
                  <div v-if="foo"/>
                </Transition>
            </template>
            <style scoped>
            .foo {}
            .bar {}
            </style>
            `,
      errors: [
        {
          message:
            "The `enter-class` prop is renamed in Vue 3. Rename to `enter-from-class`.",
          line: 4,
          column: 19,
        },
        {
          message:
            "The `leave-class` prop is renamed in Vue 3. Rename to `leave-from-class`.",
          line: 5,
          column: 19,
        },
      ],
    },
    {
      code: `
            <template>
                <Transition name="xx"><div v-if="foo"/></Transition>
            </template>
            <style scoped>
            .xx-enter {}
            .xx-leave {}
            </style>
            `,
      errors: [
        "The `v-enter` class is renamed in Vue 3.",
        "The `v-leave` class is renamed in Vue 3.",
      ],
    },
    {
      code: `
            <template>
                <Transition><div v-if="foo"/></Transition>
            </template>
            <style scoped>
            @media screen and (min-width: 900px) {
                .v-enter {}
                .v-leave {}
            }
            </style>
            `,
      errors: [
        "The `v-enter` class is renamed in Vue 3.",
        "The `v-leave` class is renamed in Vue 3.",
      ],
    },
    {
      code: `
            <template>
                <Transition><div v-if="foo"/></Transition>
            </template>
            <style scoped>
            .foo {
              @nest & .v-enter {}
              @nest & .v-leave {}
            }
            </style>
            `,
      errors: [
        "The `v-enter` class is renamed in Vue 3.",
        "The `v-leave` class is renamed in Vue 3.",
      ],
    },
    {
      code: `
            <template>
                <Transition :name="name"><div v-if="foo"/></Transition>
            </template>
            <script>
            export default {
                computed: {
                    name () { return 'xx' }
                }
            }
            </script>
            <style scoped>
            .xx-enter {}
            .xx-leave {}
            </style>
            `,
      errors: [
        "The `v-enter` class is renamed in Vue 3.",
        "The `v-leave` class is renamed in Vue 3.",
      ],
    },
    {
      code: `
            <template>
                <Transition :name="name"><div v-if="foo"/></Transition>
            </template>
            <script>
            export default {
                computed: {
                    name () { return 'x' + x }
                }
            }
            </script>
            <style scoped>
            .xx-enter {}
            .xx-leave {}
            </style>
            `,
      errors: [
        "The `v-enter` class is renamed in Vue 3.",
        "The `v-leave` class is renamed in Vue 3.",
      ],
    },
  ],
});
