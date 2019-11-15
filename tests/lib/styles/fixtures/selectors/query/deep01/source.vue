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
            <div id="n" class="bar" />
            <div id="o" class="baz" />
            <div id="p" class="qux" />
            <div id="q" class="bar" />
            <div id="r" class="baz" />
            <div id="s" class="qux" />
        </li>
    </ul>
</template>
<style scoped>
#g >>> .bar {
}
#g /deep/ .bar {
}
#g ::v-deep .bar {
}
</style>

