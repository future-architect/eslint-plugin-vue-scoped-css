<template>
    <div :class="classes" />
</template>
<script>
export default {
    computed:{
        classes() {
            return [`foo-${a}`]
        }
    }
}
</script>
<style scoped lang="scss">
.foo-#{$bar}-baz {
}
</style>
