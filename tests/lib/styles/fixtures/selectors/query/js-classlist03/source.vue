<script>
export default {
    mounted() {
        a.classList.remove("foo", "bar")
        a.classList.unknown("baz")
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
</style>
