---
pageClass: "rule-details"
sidebarDepth: 0
title: "vue-scoped-css/require-v-slotted-argument"
description: "require selector argument to be passed to `::v-slotted()`"
---
# vue-scoped-css/require-v-slotted-argument

> require selector argument to be passed to `::v-slotted()`

- :gear: This rule is included in `"plugin:vue-scoped-css/vue3-recommended"` and `"plugin:vue-scoped-css/all"`.

## :book: Rule Details

This rule reports `::v-slotted` pseudo-element with no selector argument passed.

<eslint-code-block :rules="{'vue-scoped-css/require-v-slotted-argument': ['error']}">

```vue
<style scoped>
/* ✗ BAD */
.baz .qux ::v-slotted() {}
.baz .qux ::v-slotted {}

/* ✓ GOOD */
.baz .qux ::v-slotted(.foo .bar) {}
</style>
```

</eslint-code-block>

## :wrench: Options

Nothing.

## Implementation

- [Rule source](https://github.com/future-architect/eslint-plugin-vue-scoped-css/blob/master/lib/rules/require-v-slotted-argument.ts)
- [Test source](https://github.com/future-architect/eslint-plugin-vue-scoped-css/blob/master/tests/lib/rules/require-v-slotted-argument.js)
