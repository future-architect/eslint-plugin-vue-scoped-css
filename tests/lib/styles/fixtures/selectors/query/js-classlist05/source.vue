<script>
export default {
    mounted() {
        // eslint-disable-next-line dot-notation
        this.$refs.a["classList"].remove("foo")
        // eslint-disable-next-line dot-notation
        this.$refs.b["classList"]["remove"]("bar")


        this.$refs.a[classList].remove("baz")
        // eslint-disable-next-line dot-notation
        this.$refs.b["classList"][remove]("baz")
    }
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
