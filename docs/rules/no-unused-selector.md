---
pageClass: "rule-details"
sidebarDepth: 0
title: "vue-scoped-css/no-unused-selector"
description: "disallow selectors defined in Scoped CSS that don't use in `<template>`"
---
# vue-scoped-css/no-unused-selector

> disallow selectors defined in Scoped CSS that don't use in `<template>`

- :gear: This rule is included in all of `"plugin:vue-scoped-css/all"`, `"plugin:vue-scoped-css/recommended"` and `"plugin:vue-scoped-css/vue3-recommended"`.

## :book: Rule Details

This rule reports selectors defined in Scoped CSS not used in `<template>`.

This rule statically analyzes type selectors, ID selectors, class selectors, combinators and universal selectors among the selectors defined in CSS.

<eslint-code-block :rules="{'vue-scoped-css/no-unused-selector': ['error']}">

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

/* ✓ GOOD */
div {}
#id_a {}
.class-b {}
.class-b > .class-c {}

/* For a CSS rule with the selector `.a .b`, if the element that matches `.a` contains a recursive child component, then all `.b` in that child component will be matched by the rule. */
.class-decoration .class-b {}

/* ignores */
*[disabled] {}
*:hover {}
</style>
```

</eslint-code-block>

In order to match the root element with a class selector, you need to set at least one matching class name.
This is a limitation of this rule. Without this limitation, the root element can apply all class selectors.

<eslint-code-block :rules="{'vue-scoped-css/no-unused-selector': ['error']}">

```vue
<template>
  <div></div>
</template>
<style scoped>
/* ✗ BAD */
.root-decoration {}
</style>
```

</eslint-code-block>

<eslint-code-block :rules="{'vue-scoped-css/no-unused-selector': ['error']}">

```vue
<template>
  <div class="root-class"></div>
</template>
<style scoped>
/* ✓ GOOD */
.root-class.root-decoration {}
</style>
```

</eslint-code-block>

## :wrench: Options

```json
{
  "vue-scoped-css/no-unused-selector": ["error", {
    "ignoreBEMModifier": false,
    "captureClassesFromDoc": [],
    "checkUnscoped": false,
  }]
}
```

- `ignoreBEMModifier` ... Set `true` if you want to ignore the `BEM` modifier. Default is false.
- `captureClassesFromDoc` ... Specifies the regexp that extracts the class name from the documentation in the comments. Even if there is no matching element, no error is reported if the document of a class name exists in the comments.
- `checkUnscoped` ... The rule only checks `<style scoped>` by default, but if set to `true` it will also check `<style>` without the scoped attribute. If you set it to `true`, be very careful that the warned CSS may actually be used outside the `.vue` file.

### `"ignoreBEMModifier": true`

<eslint-code-block :rules="{'vue-scoped-css/no-unused-selector': ['error', {ignoreBEMModifier: true}]}">

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

<eslint-code-block :rules="{'vue-scoped-css/no-unused-selector': ['error', {captureClassesFromDoc: ['/(\\.[a-z-]+)(?::[a-z-]+)?\\s+-\\s*[^\\r\\n]+/i']}]}">

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

- [vue-scoped-css/require-selector-used-inside]
- [Vue Loader - Scoped CSS]
- [KSS]

[Vue Loader - Scoped CSS]: https://vue-loader.vuejs.org/guide/scoped-css.html
[vue-scoped-css/require-selector-used-inside]: ./require-selector-used-inside.md
[KSS]: http://warpspire.com/kss/

## Implementation

- [Rule source](https://github.com/future-architect/eslint-plugin-vue-scoped-css/blob/master/lib/rules/no-unused-selector.ts)
- [Test source](https://github.com/future-architect/eslint-plugin-vue-scoped-css/blob/master/tests/lib/rules/no-unused-selector.ts)
