<template>
    <div />
</template>
<style scoped lang="scss">
.foo1, .foo2 {
  .bar:not(&), :not(& .bar) {
  }
}
</style>
