<template>
    <ul class="foo">
        <template>
            <li id="a" class="bar" />
            <li id="b" class="baz" />
            <li id="c" class="qux" />
            <li id="d" class="bar" />
            <li id="e" class="baz" />
            <li id="f" class="qux" />
        </template>
    </ul>
</template>
<style scoped>
.foo > li.bar {
}
</style>
