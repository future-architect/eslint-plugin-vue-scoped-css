---
pageClass: "rule-details"
sidebarDepth: 0
title: "vue-scoped-css/no-unused-keyframes"
description: "disallow `@keyframes` which don't use in Scoped CSS"
---
# vue-scoped-css/no-unused-keyframes

> disallow `@keyframes` which don't use in Scoped CSS

- :gear: This rule is included in all of `"plugin:vue-scoped-css/all"`, `"plugin:vue-scoped-css/recommended"` and `"plugin:vue-scoped-css/vue3-recommended"`.

## :book: Rule Details

This rule reports `@keyframes` is not used in Scoped CSS.

<eslint-code-block :rules="{'vue-scoped-css/no-unused-keyframes': ['error']}">

```vue
<style scoped>
.item {
    animation-name: slidein;
}

/* ✗ BAD */
@keyframes unused-animation {
}

/* ✓ GOOD */
@keyframes slidein {
}
</style>
```

</eslint-code-block>

## :wrench: Options

```json
{
  "vue-scoped-css/no-unused-keyframes": ["error", {
    "checkUnscoped": false
  }]
}
```

- `checkUnscoped` ... The rule only checks `<style scoped>` by default, but if set to `true` it will also check `<style>` without the scoped attribute. If you set it to `true`, be very careful that the warned CSS may actually be used outside the `.vue` file.

## Implementation

- [Rule source](https://github.com/future-architect/eslint-plugin-vue-scoped-css/blob/master/lib/rules/no-unused-keyframes.ts)
- [Test source](https://github.com/future-architect/eslint-plugin-vue-scoped-css/blob/master/tests/lib/rules/no-unused-keyframes.ts)
