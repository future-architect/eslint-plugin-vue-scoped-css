---
pageClass: "rule-details"
sidebarDepth: 0
title: "vue-scoped-css/no-parent-of-v-global"
description: "disallow parent selector for `::v-global` pseudo-element"
---
# vue-scoped-css/no-parent-of-v-global

> disallow parent selector for `::v-global` pseudo-element

- :gear: This rule is included in `"plugin:vue-scoped-css/all"` and `"plugin:vue-scoped-css/vue3-recommended"`.

## :book: Rule Details

This rule reports parent selector for `::v-global` pseudo-element.

<eslint-code-block :rules="{'vue-scoped-css/no-parent-of-v-global': ['error']}">

```vue
<style scoped>
/* ✗ BAD */
.bar ::v-global(.foo) {}

/* ✓ GOOD */
::v-global(.foo) {}
</style>
```

</eslint-code-block>

## :wrench: Options

Nothing.

## Implementation

- [Rule source](https://github.com/future-architect/eslint-plugin-vue-scoped-css/blob/master/lib/rules/no-parent-of-v-global.ts)
- [Test source](https://github.com/future-architect/eslint-plugin-vue-scoped-css/blob/master/tests/lib/rules/no-parent-of-v-global.ts)
