<template>
    <div>
        <div :class="classes1" />
        <div :class="classes2" />
    </div>
</template>
<script>
export default {
    computed:{
        classes1() {
            return [`foo-${a}`]
        },
        classes2() {
            return {
                [`foo-${a}bar-baz`]: true
            }
        }
    }
}
</script>
<style scoped lang="scss">
.foo-bar-baz {
}
.bar-baz {
}
</style>
