<script>
export default {
    // eslint-disable-next-line object-shorthand
    data: function () {
        return {
            classData: { bar: false },
            classData2: { foo: this.foo }
        }
    },
}
</script>
<template>
    <ul>
        <li id="a" :class="classData" />
        <li id="b" :class="classData2" />
    </ul>
</template>
<style scoped>
.bar {
}
</style>
