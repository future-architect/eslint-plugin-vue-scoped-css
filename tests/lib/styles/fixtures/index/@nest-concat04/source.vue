<template>
    <div />
</template>
<style scoped>
-foo {
  @nest .bar&-baz {
  }
  @nest .bar&>-baz {
  }
  @nest .bar>&>-baz {
  }
}
</style>
