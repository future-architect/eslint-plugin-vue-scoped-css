<template>
    <div />
</template>
<style scoped>
-foo {
  @nest .bar&-baz {
  }
}

.foo {
  @nest .bar&.baz {
  }
}

#foo {
  @nest .bar&:baz {
  }
}

foo {
  @nest .bar&baz {
  }
}

__foo {
  @nest .bar&--baz {
  }
}

-foo {
  @nest #bar&-baz {
  }
}

-foo {
  @nest :bar&-baz {
  }
}
</style>
