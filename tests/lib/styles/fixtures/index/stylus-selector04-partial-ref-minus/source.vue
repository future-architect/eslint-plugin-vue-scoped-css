<template>
    <div />
</template>
<style scoped lang="stylus">
.foo
  &__bar
    &_baz
      width: 10px

      ^[-1]:hover &
        width: 20px
</style>
