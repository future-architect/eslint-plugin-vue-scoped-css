<template>
    <ul class="foo">
        <slot>
            <li id="a" class="bar" />
            <li id="b" class="baz" />
            <li id="c" class="qux" />
            <li id="d" class="bar" />
            <li id="e" class="baz" />
            <li id="f" class="qux" />
        </slot>
    </ul>
</template>
<style scoped>
.foo > li.bar {
}

.foo li.bar {
}

.foo > div > li.bar {
}

.foo > div {
}
</style>
