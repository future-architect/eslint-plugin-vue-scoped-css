---
pageClass: "rule-details"
sidebarDepth: 0
title: "vue-scoped-css/require-v-global-argument"
description: "require selector argument to be passed to `::v-global()`"
---
# vue-scoped-css/require-v-global-argument

> require selector argument to be passed to `::v-global()`

- :gear: This rule is included in `"plugin:vue-scoped-css/all"` and `"plugin:vue-scoped-css/vue3-recommended"`.

## :book: Rule Details

This rule reports `::v-global` pseudo-element with no selector argument passed.

<eslint-code-block :rules="{'vue-scoped-css/require-v-global-argument': ['error']}">

```vue
<style scoped>
/* ✗ BAD */
::v-global() {}
::v-global {}

/* ✓ GOOD */
::v-global(.foo .bar) {}
</style>
```

</eslint-code-block>

## :wrench: Options

Nothing.

## Implementation

- [Rule source](https://github.com/future-architect/eslint-plugin-vue-scoped-css/blob/master/lib/rules/require-v-global-argument.ts)
- [Test source](https://github.com/future-architect/eslint-plugin-vue-scoped-css/blob/master/tests/lib/rules/require-v-global-argument.ts)
