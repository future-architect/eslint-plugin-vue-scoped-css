---
pageClass: "rule-details"
sidebarDepth: 0
title: "vue-scoped-css/require-scoped"
description: "enforce the `<style>` tags to has the `scoped` attribute"
---
# vue-scoped-css/require-scoped

> enforce the `<style>` tags to has the `scoped` attribute

- :warning: This rule was **deprecated** and replaced by [vue-scoped-css/enforce-style-type](enforce-style-type.md) rule.

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

## :wrench: Options

Default is set to `always`.

```json
{
  "vue-scoped-css/require-scoped": ["error", "always" | "never"]
}
```

- `"always"` (default) ... requires `scoped`.
- `"never"` ... disallowed `scoped`.

### `"never"`

<eslint-code-block :rules="{'vue-scoped-css/require-scoped': ['error', 'never']}">

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

- [Rule source](https://github.com/future-architect/eslint-plugin-vue-scoped-css/blob/master/lib/rules/require-scoped.ts)
- [Test source](https://github.com/future-architect/eslint-plugin-vue-scoped-css/blob/master/tests/lib/rules/require-scoped.ts)
