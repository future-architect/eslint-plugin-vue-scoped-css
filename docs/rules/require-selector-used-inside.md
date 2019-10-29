---
pageClass: "rule-details"
sidebarDepth: 0
title: "vue-scoped-css/require-selector-used-inside"
description: "Reports the defined selectors is not used inside `<template>`."
---
# vue-scoped-css/require-selector-used-inside

> Reports the defined selectors is not used inside `<template>`.

- :gear: This rule is included in `"plugin:vue-scoped-css/all"`.

## :book: Rule Details

This rule reports the defined selectors is not used inside `<template>`.

Similar to the [vue-scoped-css/no-unused-selector](./no-unused-selector.md) rule, with differences.
This rule requires elements that matches the first selector be included in `<template>`.

<eslint-code-block :rules="{'vue-scoped-css/require-selector-used-inside': ['error']}">

```vue
<template>
  <div>
    <input>
    <div id="id_a"></div>
    <div class="class-b">
      <div class="class-c"></div>
    </div>
  </div>
</template>
<style scoped>
/* ✗ BAD */
ul {}
#id_unknown {}
.class-unknown {}
.class-b > .class-unknown {}
/* there is a difference in behavior from `no-unused-selector`. */
.class-decoration .class-b {}

/* ✓ GOOD */
div {}
#id_a {}
.class-b {}
.class-b > .class-c {}
</style>
```

</eslint-code-block>

## :wrench: Options

```json
{
  "vue-scoped-css/require-selector-used-inside": ["error", {
    "ignoreBEMModifier": false
  }]
}
```

- `ignoreBEMModifier` ... Set `true` if you want to ignore the `BEM` modifier. Default is false.

## :books: Further reading

- [vue-scoped-css/no-unused-selector]
- [Vue Loader - Scoped CSS]

[Vue Loader - Scoped CSS]: https://vue-loader.vuejs.org/guide/scoped-css.html
[vue-scoped-css/no-unused-selector]: ./no-unused-selector.md

## Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-vue-scoped-css/blob/master/lib/rules/require-selector-used-inside.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-vue-scoped-css/blob/master/tests/lib/rules/require-selector-used-inside.js)
