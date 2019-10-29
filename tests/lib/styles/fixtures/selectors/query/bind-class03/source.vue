<template>
    <ul>
        <li id="a" :class="{ foo: true, }" />
        <li id="b" :class="{ bar: true , }" />
        <li id="c" :class="{ baz, }" />
        <li id="d" :class="{ qux, bar, }" />
        <li id="e" :class="{ quux, foo, 'bar': true, }" />
        <li id="f" :class="{ grault, foo, bar: bar, }" />
        <li id="g" :class="{ foo, ...garply, }" />
        <li id="h" :class="{ [waldo]: true, }" />
    </ul>
</template>
<style scoped>
.bar {
}
</style>
