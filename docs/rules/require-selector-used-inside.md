---
pageClass: "rule-details"
sidebarDepth: 0
title: "vue-scoped-css/require-selector-used-inside"
description: "disallow selectors defined that is not used inside `<template>`"
---
# vue-scoped-css/require-selector-used-inside

> disallow selectors defined that is not used inside `<template>`

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
    "ignoreBEMModifier": false,
    "captureClassesFromDoc": []
  }]
}
```

- `ignoreBEMModifier` ... Set `true` if you want to ignore the `BEM` modifier. Default is false.
- `captureClassesFromDoc` ... Specifies the regexp that extracts the class name from the documentation in the comments. Even if there is no matching element, no error is reported if the document of a class name exists in the comments.

### `"ignoreBEMModifier": true`

<eslint-code-block :rules="{'vue-scoped-css/require-selector-used-inside': ['error', {ignoreBEMModifier: true}]}">

```vue
<template>
  <div class="cool-component"></div>
</template>
<style scoped>
/* ✓ GOOD */
.cool-component--active {}
</style>
```

</eslint-code-block>

### `"captureClassesFromDoc": [ "/(\\.[a-z-]+)(?::[a-z-]+)?\\s+-\\s*[^\\r\\n]+/i" ]`

Example of [KSS] format:

<eslint-code-block :rules="{'vue-scoped-css/require-selector-used-inside': ['error', {captureClassesFromDoc: ['/(\\.[a-z-]+)(?::[a-z-]+)?\\s+-\\s*[^\\r\\n]+/i']}]}">

```vue
<template>
  <div>
    <a class="button star"></a>
  </div>
</template>
<style scoped lang="scss">
/* ✓ GOOD */

// A button suitable for giving a star to someone.
//
// :hover             - Subtle hover highlight.
// .star-given        - A highlight indicating you've already given a star.
// .star-given:hover  - Subtle hover highlight on top of star-given styling.
// .disabled          - Dims the button to indicate it cannot be used.
//
// Styleguide 2.1.3.
a.button.star {
  &.star-given {
  }
  &.disabled {
  }
}
</style>
```

</eslint-code-block>

## :books: Further reading

- [vue-scoped-css/no-unused-selector]
- [Vue Loader - Scoped CSS]
- [KSS]

[Vue Loader - Scoped CSS]: https://vue-loader.vuejs.org/guide/scoped-css.html
[vue-scoped-css/no-unused-selector]: ./no-unused-selector.md
[KSS]: http://warpspire.com/kss/

## Implementation

- [Rule source](https://github.com/future-architect/eslint-plugin-vue-scoped-css/blob/master/lib/rules/require-selector-used-inside.ts)
- [Test source](https://github.com/future-architect/eslint-plugin-vue-scoped-css/blob/master/tests/lib/rules/require-selector-used-inside.js)
