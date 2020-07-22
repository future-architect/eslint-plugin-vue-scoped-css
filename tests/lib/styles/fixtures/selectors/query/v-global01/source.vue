<template>
    <ul class="bar">
        <li id="a" />
        <li id="b" />
        <li id="c" />
        <li id="d" />
    </ul>
</template>
<style scoped>
::v-global(#a) {
}
::v-global(#a, #b) {
}
::v-global(#c, #d) {
}
.foo ::v-global(#a) {
}
.foo ::v-global(#a, #b) {
}
</style>
