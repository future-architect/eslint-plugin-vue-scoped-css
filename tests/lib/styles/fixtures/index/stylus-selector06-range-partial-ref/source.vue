<template>
    <div />
</template>
<style scoped lang="stylus">
.foo
  .bar
    .baz
      width: 10px

      .a ^[1..-1]
      .b ^[-2..-1]
        width: 20px
</style>
