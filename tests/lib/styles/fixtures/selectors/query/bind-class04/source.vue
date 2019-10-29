<template>
    <ul>
        <li 
            v-if="bar"
            id="a"
            :clazz="'bar'"
            :class="'foo'"
        />
        <li
            id="b" 
            :clazz="'foo'"
            :class="'bar'"
        />
        <li id="c" :class="'baz'" />
        <li id="d" :class="'qux'" :[class]="baz" />
        <li id="e" :class="" />
    </ul>
</template>
<style scoped>
.bar {
}
</style>
