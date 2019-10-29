<template>
    <ul>
        <li
            v-if="b"
            :id="'a'"
            :iid="'b'"
            class="foo"
        />
        <li 
            v-if="a"
            :id="'b'"
            :iid="'a'"
            class="bar"
        />
        <li id class="baz" />
        <li :[id]="b" class="qux" />
        <li :id="" class="quux" />
    </ul>
</template>
<style scoped>
#b {
}
</style>
