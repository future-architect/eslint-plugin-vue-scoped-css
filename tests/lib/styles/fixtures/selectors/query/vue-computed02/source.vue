<script>
export default {
    computed: {
        // eslint-disable-next-line object-shorthand
        classComp: function () {
            return { bar: this.bar }
        },
        // eslint-disable-next-line object-shorthand
        classComp2: function () {
            return { foo: this.foo }
        },
    },
}
</script>
<template>
    <ul>
        <li id="a" :class="classComp" />
        <li id="b" :class="classComp2" />
    </ul>
</template>
<style scoped>
.bar {
}
</style>
