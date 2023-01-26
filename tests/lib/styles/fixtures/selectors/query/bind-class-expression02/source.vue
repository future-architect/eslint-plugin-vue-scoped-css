<script>
export default {
    computed: {
        foo () {
            return 'foo'
        },
        bar () {
            return 'bar'
        },
        a: () => 'a',
        b: () => 'b',
        c: () => 'c',
        d: () => 'd',
    }
}
</script>
<template>
    <ul>
        <li id="a" :class="a || 'foo'" />
        <li id="b" :class="b && 'bar'" />
        <li id="c" :class="c ?? 'foo'" />
        <li id="d" :class="d && foo" />
        <li id="e" :class="[foo || bar]" />
        <li id="f" :class="[bar && 'b']" />
        <li id="g" :class="[foo ?? 'a']" />
    </ul>
</template>
<style scoped>
.foo {
}
.bar {
}
</style>
