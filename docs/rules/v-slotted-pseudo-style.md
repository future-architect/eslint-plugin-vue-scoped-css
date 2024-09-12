---
pageClass: "rule-details"
sidebarDepth: 0
title: "vue-scoped-css/v-slotted-pseudo-style"
description: "enforce `:slotted()`/`::v-slotted()` style"
---
# vue-scoped-css/v-slotted-pseudo-style

> enforce `:slotted()`/`::v-slotted()` style

- :gear: This rule is included in `"plugin:vue-scoped-css/all"`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule enforces slotted pseudo style which you should use `:slotted()` or `::v-slotted()`.

<eslint-code-block fix :rules="{'vue-scoped-css/v-slotted-pseudo-style': ['error']}">

```vue
<style scoped>
/* ✗ BAD */
.foo ::v-slotted(.bar) {}

/* ✓ GOOD */
.foo :slotted(.bar) {}
</style>
```

</eslint-code-block>

## :wrench: Options

```json
{
  "vue-scoped-css/v-slotted-pseudo-style": [
    "error",
    ":slotted" // or "::v-slotted"
  ]
}
```

- `":slotted"` (default) ... requires using `:slotted()`.
- `"::v-slotted"` ... requires using `::v-slotted()`.

## :books: Further reading

- [Vue.js - API SFC CSS Features > Slotted Selectors](https://vuejs.org/api/sfc-css-features.html#slotted-selectors)

## Implementation

- [Rule source](https://github.com/future-architect/eslint-plugin-vue-scoped-css/blob/master/lib/rules/v-slotted-pseudo-style.ts)
- [Test source](https://github.com/future-architect/eslint-plugin-vue-scoped-css/blob/master/tests/lib/rules/v-slotted-pseudo-style.ts)
