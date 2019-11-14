<template>
    <div />
</template>
<style scoped>
-foo {
  @nest .bar& {
  }
}

.foo {
  @nest .bar& {
  }
}

#foo {
  @nest .bar& {
  }
}

foo {
  @nest .bar& {
  }
}

__foo {
  @nest .bar& {
  }
}

-foo {
  @nest #bar& {
  }
}

-foo {
  @nest :bar& {
  }
}
</style>
