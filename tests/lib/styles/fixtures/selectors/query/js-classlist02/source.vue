<script>
export default {
    mounted() {
        this.$refs.a.classList.contains("foo")
        $refs.b.classList.add("bar", "baz")


        $el.classList.replace("qux", "quux")
    },
}
</script>
<template>
    <ul>
        <li id="a" ref="a" />
        <li id="b" ref="b" />
    </ul>
</template>
<style scoped>
.foo {
}

.bar {
}

.baz {
}

.qux {
}

.quux {
}
</style>
