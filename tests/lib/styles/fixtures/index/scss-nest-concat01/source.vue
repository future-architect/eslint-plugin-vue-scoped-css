<template>
    <div />
</template>
<style scoped lang="scss">
-foo {
  .bar&-baz {
  }
  .bar&>-baz {
  }
  .bar>&>-baz {
  }
}

-foo > {
  .bar&-baz {
  }
  .bar&>-baz {
  }
  .bar>&>-baz {
  }
}
</style>
