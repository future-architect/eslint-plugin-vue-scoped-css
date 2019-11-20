<template>
    <div />
</template>
<style scoped lang="stylus">
vendors = webkit moz o ms official

border-radius()
  for vendor in vendors
    if vendor == official
      border-radius: arguments
    else
      -{vendor}-border-radius: arguments
#content
  border-radius: 5px
</style>
