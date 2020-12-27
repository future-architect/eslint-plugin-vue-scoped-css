---
pageClass: "rule-details"
sidebarDepth: 0
title: "vue-scoped-css/no-deprecated-v-enter-v-leave-class"
description: "disallow v-enter and v-leave classes."
---
# vue-scoped-css/no-deprecated-v-enter-v-leave-class

> disallow v-enter and v-leave classes.

- :gear: This rule is included in `"plugin:vue-scoped-css/all"`.

## :book: Rule Details

This rule reports the use of the `v-enter` and `v-leave` classes renamed in Vue 3 as an error.  
You should change it to use the `v-enter-from` and `v-leave-from` classes instead.

See [Migration from Vue 2 - Transition Class Change] for more details.

<eslint-code-block :rules="{'vue-scoped-css/no-deprecated-v-enter-v-leave-class': ['error']}">

```vue
<template>
  <Transition><div v-if="foo"/></Transition>
  <Transition name="fade"><div v-if="foo"/></Transition>
</template>
<style scoped>
/* ✗ BAD */
.v-enter {}
.v-leave {}
.fade-enter {}
.fade-leave {}

/* ✓ GOOD */
.v-enter-from {}
.v-leave-from {}
.fade-enter-from {}
.fade-leave-from {}
</style>
```

</eslint-code-block>

If you define both old and new in the same selector, no error will be reported.

<eslint-code-block :rules="{'vue-scoped-css/no-deprecated-v-enter-v-leave-class': ['error']}">

```vue
<template>
  <Transition><div v-if="foo"/></Transition>
</template>
<style scoped>
/* ✓ GOOD */
.v-enter, .v-enter-from {}
.v-leave, .v-leave-from {}
</style>
```

</eslint-code-block>

This rule also reports `enter-class` and `leave-class` props.

<eslint-code-block :rules="{'vue-scoped-css/no-deprecated-v-enter-v-leave-class': ['error']}">

```vue
<template>
  <!-- ✗ BAD -->
  <Transition
    enter-class="my-enter"
    leave-class="my-leave">
    <div v-if="foo"/>
  </Transition>

  <!-- ✓ GOOD -->
  <Transition
    enter-from-class="my-enter"
    leave-from-class="my-leave">
    <div v-if="foo"/>
  </Transition>

  <!-- If you define both old and new, no error will be reported. -->
  <Transition
    enter-class="my-enter"
    enter-from-class="my-enter"
    leave-class="my-leave"
    leave-from-class="my-leave">
    <div v-if="foo"/>
  </Transition>
</template>
<style>
.my-enter {}
.my-leave {}
</style>
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :books: Further reading

- [Migration from Vue 2 - Transition Class Change]

[Migration from Vue 2 - Transition Class Change]: https://v3.vuejs.org/guide/migration/transition.html

## Implementation

- [Rule source](https://github.com/future-architect/eslint-plugin-vue-scoped-css/blob/master/lib/rules/no-deprecated-v-enter-v-leave-class.ts)
- [Test source](https://github.com/future-architect/eslint-plugin-vue-scoped-css/blob/master/tests/lib/rules/no-deprecated-v-enter-v-leave-class.js)
