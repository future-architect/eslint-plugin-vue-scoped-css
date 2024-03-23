---
pageClass: "rule-details"
sidebarDepth: 0
title: "vue-scoped-css/no-parsing-error"
description: "disallow parsing errors in `<style>`"
---
# vue-scoped-css/no-parsing-error

> disallow parsing errors in `<style>`

- :gear: This rule is included in all of `"plugin:vue-scoped-css/all"`, `"plugin:vue-scoped-css/recommended"` and `"plugin:vue-scoped-css/vue3-recommended"`.

## :book: Rule Details

This rule reports syntax errors in `<style>`. 

<eslint-code-block :rules="{'vue-scoped-css/no-parsing-error': ['error']}">

```vue
<style scoped>
/* ✗ BAD */
.item {
</style>
```

</eslint-code-block>

## :wrench: Options

Nothing.

## Implementation

- [Rule source](https://github.com/future-architect/eslint-plugin-vue-scoped-css/blob/master/lib/rules/no-parsing-error.ts)
- [Test source](https://github.com/future-architect/eslint-plugin-vue-scoped-css/blob/master/tests/lib/rules/no-parsing-error.js)
