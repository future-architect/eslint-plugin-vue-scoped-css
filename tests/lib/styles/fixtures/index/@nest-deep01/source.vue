<template>
    <div />
</template>
<style scoped>
.foo1, .foo2 {
  @nest .bar:not(&), :not(& .bar) {
  }
}
</style>
