---
pageClass: "rule-details"
sidebarDepth: 0
title: "vue-scoped-css/require-scoped"
description: "Enforce the `<style>` tags to has the `scoped` attribute."
---
# vue-scoped-css/require-scoped

> Enforce the `<style>` tags to has the `scoped` attribute.

- :gear: This rule is included in `"plugin:vue-scoped-css/recommended"` and `"plugin:vue-scoped-css/all"`.

## :book: Rule Details

This rule reports the `<style>` tags missing the `scoped` attribute.

<eslint-code-block :rules="{'vue-scoped-css/require-scoped': ['error']}">

```vue
<template>
</template>

<!-- ✗ BAD -->
<style>
</style>

<!-- ✓ GOOD -->
<style scoped>
</style>
```

</eslint-code-block>

## :books: Further reading

- [Vue Loader - Scoped CSS]

[Vue Loader - Scoped CSS]: https://vue-loader.vuejs.org/guide/scoped-css.html

## Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-vue-scoped-css/blob/master/lib/rules/require-scoped.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-vue-scoped-css/blob/master/tests/lib/rules/require-scoped.js)
