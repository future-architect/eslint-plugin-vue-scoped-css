<template>
    <ul class="foo">
        <li id="a" class="bar" />
        <li id="b" class="baz" />
        <li id="c" class="qux" />
        <li id="d" class="bar" />
        <li id="e" class="baz" />
        <li id="f" class="qux" />
        <li id="g">
            <ul>
                <li id="h" class="bar" />
                <li id="i" class="baz" />
                <li id="j" class="qux" />
                <li id="k" class="bar" />
                <li id="l" class="baz" />
                <li id="m" class="qux" />
            </ul>
        </li>
    </ul>
</template>
<style scoped>
#g >>> .bar {
}
</style>

