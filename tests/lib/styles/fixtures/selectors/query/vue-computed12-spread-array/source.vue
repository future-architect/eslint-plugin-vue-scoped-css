<script>
const CLASS_NAME = ["foo"]
export default {
    computed:{
        classComp() {
            return [...CLASS_NAME] // TODO supports
        },
        classComp2() {
            return [...(["foo"])] // TODO supports
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
.foo {
}
.bar {
}
</style>
