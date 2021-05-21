---
pageClass: "rule-details"
sidebarDepth: 0
title: "vue-scoped-css/enforce-style-type"
description: "enforce the `<style>` tags to has the `scoped` attribute"
---
# vue-scoped-css/enforce-style-type

> enforce the `<style>` tags to be plain or have the `scoped` or `module` attribute

- :gear: This rule is included in all of `"plugin:vue-scoped-css/recommended"`, `"plugin:vue-scoped-css/vue3-recommended"` and `"plugin:vue-scoped-css/all"`.

## :book: Rule Details

This rule reports the `<style>` tags missing the `scoped` attribute.

<eslint-code-block :rules="{'vue-scoped-css/enforce-style-type': ['error']}">

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

## :wrench: Options

Default is set to `always`.

```json
{
  "vue-scoped-css/enforce-style-type": ["error", "always" | "never"]
}
```

- `"always"` (default) ... requires `scoped`.
- `"never"` ... disallowed `scoped`.

### `"never"`

<eslint-code-block :rules="{'vue-scoped-css/enforce-style-type': ['error', 'never']}">

```vue
<template>
</template>

<!-- ✓ GOOD -->
<style>
</style>

<!-- ✗ BAD -->
<style scoped>
</style>
```

</eslint-code-block>

## :books: Further reading

- [Vue Loader - Scoped CSS]

[Vue Loader - Scoped CSS]: https://vue-loader.vuejs.org/guide/scoped-css.html

## Implementation

- [Rule source](https://github.com/future-architect/eslint-plugin-vue-scoped-css/blob/master/lib/rules/enforce-style-type.ts)
- [Test source](https://github.com/future-architect/eslint-plugin-vue-scoped-css/blob/master/tests/lib/rules/enforce-style-type.js)
