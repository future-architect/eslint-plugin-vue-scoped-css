<template>
    <ul class="foo">
        <component :is="comp">
            <li id="a" class="bar" />
            <li id="b" class="baz" />
            <li id="c" class="qux" />
            <li id="d" class="bar" />
            <li id="e" class="baz" />
            <li id="f" class="qux" />
        </component>
    </ul>
</template>
<style scoped>
.foo > div > li.bar {
}
</style>
