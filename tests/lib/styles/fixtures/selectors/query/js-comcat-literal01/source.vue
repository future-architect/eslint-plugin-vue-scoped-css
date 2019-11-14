<template>
    <div>
        <div :class="classes1" />
        <div :class="classes2" />
        <div :class="classes3" />
        <div :class="classes4" />
    </div>
</template>
<script>
export default {
    computed:{
        classes1() {
            // eslint-disable-next-line prefer-template
            return ["foo-"+a]
        },
        classes2() {
            return {
                // eslint-disable-next-line prefer-template
                ["foo-"+a+"bar-baz"]: true
            }
        },
        classes3() {
            return {
                // eslint-disable-next-line prefer-template
                ["fo"+"o-"+a+b+"-baz"]: true
            }
        },
        classes4() {
                // eslint-disable-next-line prefer-template
            return b+"-baz"
        }
    }
}
</script>
<style scoped lang="scss">
.foo-bar-baz {
}
.bar-baz {
}
.bar {
}
</style>
