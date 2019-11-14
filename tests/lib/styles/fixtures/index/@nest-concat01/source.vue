<template>
    <div />
</template>
<style scoped>
.foo {
  @nest &-bar {
  }

  @nest &.bar {
  }

  @nest &#bar {
  }

  @nest &bar {
  }

  @nest &__bar {
  }
}
#foo {
  @nest &-bar {
  }
}
:foo {
  @nest &-bar {
  }
}
</style>
