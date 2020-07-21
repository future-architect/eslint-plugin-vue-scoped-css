<template>
    <ul class="bar">
        <li id="a" />
        <li id="b" />
        <li id="c" />
        <li id="d" />
    </ul>
</template>
<style scoped>
.bar ::v-deep #a {
}
.bar ::v-deep(#a) {
}
.bar ::v-deep(#a, #b) {
}
</style>
