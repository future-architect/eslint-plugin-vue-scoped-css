<template>
    <ul class="bar">
        <slot>
            <li id="a" />
            <li id="b" />
        </slot>
        <li id="c" />
        <li id="d" />
    </ul>
</template>
<style scoped>
.bar ::v-slotted(#a, #c) {
}
.bar ::v-slotted(#a, #b, #c, #d) {
}
</style>
