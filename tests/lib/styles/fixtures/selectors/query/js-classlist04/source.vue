<script>
export default {
    ddd: {
    },
    computed: {
        a () {
            return "a"
        }
    },
    mounted() {
        this.$refs.a.unknown.add("foo")
        this.$refs.a.classList.add("bar")
    }
}
</script>
<template>
    <ul>
        <li id="a" :ref="a" />
        <li id="b" ref="b" />
    </ul>
</template>
<style scoped>
.foo {
}

.bar {
}
</style>
