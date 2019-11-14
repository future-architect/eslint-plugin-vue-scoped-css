<template>
    <ul>
        <li :id="'a'" class="foo" />
        <li :id="'b'" class="bar" />
        <li id class="baz" />
        <li :id="b" class="qux" />
        <li :id="" class="quux" />
    </ul>
</template>
<style scoped>
#b {
}
</style>
