---
pageClass: "rule-details"
sidebarDepth: 0
title: "vue-scoped-css/v-global-pseudo-style"
description: "enforce `:global()`/`::v-global()` style"
---
# vue-scoped-css/v-global-pseudo-style

> enforce `:global()`/`::v-global()` style

- :gear: This rule is included in `"plugin:vue-scoped-css/all"`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule enforces global pseudo style which you should use `:global()` or `::v-global()`.

<eslint-code-block fix :rules="{'vue-scoped-css/v-global-pseudo-style': ['error']}">

```vue
<style scoped>
/* ✗ BAD */
.foo ::v-global(.bar) {}

/* ✓ GOOD */
.foo :global(.bar) {}
</style>
```

</eslint-code-block>

## :wrench: Options

```json
{
  "vue-scoped-css/v-global-pseudo-style": [
    "error",
    ":global" // or "::v-global"
  ]
}
```

- `":global"` (default) ... requires using `:global()`.
- `"::v-global"` ... requires using `::v-global()`.

## :books: Further reading

- [Vue.js - API SFC CSS Features > Global Selectors](https://vuejs.org/api/sfc-css-features.html#global-selectors)

## Implementation

- [Rule source](https://github.com/future-architect/eslint-plugin-vue-scoped-css/blob/master/lib/rules/v-global-pseudo-style.ts)
- [Test source](https://github.com/future-architect/eslint-plugin-vue-scoped-css/blob/master/tests/lib/rules/v-global-pseudo-style.ts)
