---
pageClass: "rule-details"
sidebarDepth: 0
title: "vue-scoped-css/v-deep-pseudo-style"
description: "enforce `:deep()`/`::v-deep()` style"
---
# vue-scoped-css/v-deep-pseudo-style

> enforce `:deep()`/`::v-deep()` style

- :gear: This rule is included in `"plugin:vue-scoped-css/all"`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule enforces deep pseudo style which you should use `:deep()` or `::v-deep()`.

<eslint-code-block fix :rules="{'vue-scoped-css/v-deep-pseudo-style': ['error']}">

```vue
<style scoped>
/* ✗ BAD */
.foo ::v-deep(.bar) {}

/* ✓ GOOD */
.foo :deep(.bar) {}
</style>
```

</eslint-code-block>

## :wrench: Options

```json
{
  "vue-scoped-css/v-deep-pseudo-style": [
    "error",
    ":deep" // or "::v-deep"
  ]
}
```

- `":deep"` (default) ... requires using `:deep()`.
- `"::v-deep"` ... requires using `::v-deep()`.

## :books: Further reading

- [Vue.js - API SFC CSS Features > Deep Selectors](https://vuejs.org/api/sfc-css-features.html#deep-selectors)

## Implementation

- [Rule source](https://github.com/future-architect/eslint-plugin-vue-scoped-css/blob/master/lib/rules/v-deep-pseudo-style.ts)
- [Test source](https://github.com/future-architect/eslint-plugin-vue-scoped-css/blob/master/tests/lib/rules/v-deep-pseudo-style.ts)
