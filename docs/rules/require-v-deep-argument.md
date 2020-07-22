---
pageClass: "rule-details"
sidebarDepth: 0
title: "vue-scoped-css/require-v-deep-argument"
description: "require selector argument to be passed to `::v-deep()`."
---
# vue-scoped-css/require-v-deep-argument

> require selector argument to be passed to `::v-deep()`.

- :gear: This rule is included in `"plugin:vue-scoped-css/vue3-recommended"` and `"plugin:vue-scoped-css/all"`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule reports `::v-deep` pseudo-element with no selector argument passed.

<eslint-code-block fix :rules="{'vue-scoped-css/require-v-deep-argument': ['error']}">

```vue
<style scoped>
/* ✗ BAD */
.baz .qux ::v-deep .foo .bar {}
.baz .qux ::v-deep() .foo .bar {}

/* ✓ GOOD */
.baz .qux ::v-deep(.foo .bar) {}
</style>
```

</eslint-code-block>

## :wrench: Options

Nothing.

## Implementation

- [Rule source](https://github.com/future-architect/eslint-plugin-vue-scoped-css/blob/master/lib/rules/require-v-deep-argument.ts)
- [Test source](https://github.com/future-architect/eslint-plugin-vue-scoped-css/blob/master/tests/lib/rules/require-v-deep-argument.js)
