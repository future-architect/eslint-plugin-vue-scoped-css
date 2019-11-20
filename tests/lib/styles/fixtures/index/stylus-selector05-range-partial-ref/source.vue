<template>
    <div />
</template>
<style scoped lang="stylus">
.foo
  & .bar
    width: 10px

    ^[0]:hover ^[1..-1]
      width: 20px
</style>
