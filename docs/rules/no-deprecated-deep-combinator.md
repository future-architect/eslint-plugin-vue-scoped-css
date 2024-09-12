---
pageClass: "rule-details"
sidebarDepth: 0
title: "vue-scoped-css/no-deprecated-deep-combinator"
description: "disallow using deprecated deep combinators"
---
# vue-scoped-css/no-deprecated-deep-combinator

> disallow using deprecated deep combinators

- :gear: This rule is included in `"plugin:vue-scoped-css/all"` and `"plugin:vue-scoped-css/vue3-recommended"`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule reports the use of deprecated deep combinators as errors.

<eslint-code-block fix :rules="{'vue-scoped-css/no-deprecated-deep-combinator': ['error']}">

```vue
<style scoped>
/* ✗ BAD */
.a >>> .b {}
.a /deep/ .b {}

/* ✓ GOOD */
.a ::v-deep(.b) {} /* for Vue.js 3.x */
.a ::v-deep .b {} /* for Vue.js 2.x */
</style>
```

</eslint-code-block>

## :wrench: Options

Nothing.

## Implementation

- [Rule source](https://github.com/future-architect/eslint-plugin-vue-scoped-css/blob/master/lib/rules/no-deprecated-deep-combinator.ts)
- [Test source](https://github.com/future-architect/eslint-plugin-vue-scoped-css/blob/master/tests/lib/rules/no-deprecated-deep-combinator.ts)
