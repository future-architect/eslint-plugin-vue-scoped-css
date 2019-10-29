<script>
export default {
    mounted() {
        this.$el.classList.add("foo")
        $el.classList.remove("bar")


        classList.toggle("baz")
    },
}
</script>
<template>
    <ul>
        <li id="a" />
        <li id="b" />
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
