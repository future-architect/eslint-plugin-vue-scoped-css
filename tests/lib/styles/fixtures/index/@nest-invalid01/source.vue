<template>
    <div />
</template>
<style scoped>
@nest .foo > .bar {
}

.foo {
  @nest .bar {
  }
}
</style>
