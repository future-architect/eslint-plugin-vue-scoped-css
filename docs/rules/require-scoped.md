---
pageClass: "rule-details"
sidebarDepth: 0
title: "vue-scoped-css/require-scoped"
description: "enforce the `<style>` tags to has the `scoped` attribute"
---
# vue-scoped-css/require-scoped

> enforce the `<style>` tags to has the `scoped` or `module` attribute

- :gear: This rule is included in all of `"plugin:vue-scoped-css/recommended"`, `"plugin:vue-scoped-css/vue3-recommended"` and `"plugin:vue-scoped-css/all"`.

## :book: Rule Details

This rule reports the `<style>` tags missing the `scoped` (or `module`) attribute.

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
  "vue-scoped-css/require-scoped": ["error", "always" | "never", {
    "module": undefined | "accept" | "enforce"
  }]
}
```

- `"always"` (default) ... requires `scoped`.
- `"never"` ... disallows `scoped`.
- `module` ... Set to `accept` if you want to accept CSS Modules as an alternative to scoped styles. Set to `enforce` if the styles should be scoped via CSS Modules. Default is `undefined`.

### `"module": "accept"`

<eslint-code-block :rules="{'vue-scoped-css/require-scoped': ['error', 'always', { module: 'accept' }]}">

```vue
<template>
</template>

<!-- ✗ BAD -->
<style>
</style>

<!-- ✓ GOOD -->
<style scoped>
</style>

<style module>
</style>

<style module="$style">
</style>
```

</eslint-code-block>

### `"module": "enforce"`

<eslint-code-block :rules="{'vue-scoped-css/require-scoped': ['error', 'always', { module: 'enforce' }]}">

```vue
<template>
</template>

<!-- ✗ BAD -->
<style>
</style>

<style scoped>
</style>

<!-- ✓ GOOD -->
<style module>
</style>

<style module="$style">
</style>
```

</eslint-code-block>

### `"never"`

<eslint-code-block :rules="{'vue-scoped-css/require-scoped': ['error', 'never']}">

```vue
<template>
</template>

<!-- ✓ GOOD -->
<style>
</style>

<style module>
</style>

<style module="$styles">
</style>

<!-- ✗ BAD -->
<style scoped>
</style>
```

</eslint-code-block>

### `["never", { module: "enforce" }]`

<eslint-code-block :rules="{'vue-scoped-css/require-scoped': ['error', 'never', { module: 'enforce' }]}">

```vue
<template>
</template>

<!-- ✓ GOOD -->
<style>
</style>

<style scoped>
</style>

<!-- ✗ BAD -->
<style module>
</style>

<style module="$styles">
</style>
```

</eslint-code-block>

## :books: Further reading

- [Vue Loader - Scoped CSS]

[Vue Loader - Scoped CSS]: https://vue-loader.vuejs.org/guide/scoped-css.html

## Implementation

- [Rule source](https://github.com/future-architect/eslint-plugin-vue-scoped-css/blob/master/lib/rules/require-scoped.ts)
- [Test source](https://github.com/future-architect/eslint-plugin-vue-scoped-css/blob/master/tests/lib/rules/require-scoped.js)
