<script>
export default {
    computed: {
        foo () {
            return 'foo'
        },
        bar () {
            return 'bar'
        },
    }
}
</script>
<template>
    <ul>
        <li id="a" :class="a ? 'foo' : 'bar'" />
        <li id="b" :class="b ? 'a' : 'b'" />
        <li id="c" :class="[c ? 'foo' : bar]" />
        <li id="d" :class="[b ? foo : 'a']" />
    </ul>
</template>
<style scoped>
.foo {
}
.bar {
}
</style>
