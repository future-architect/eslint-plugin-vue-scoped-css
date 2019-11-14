<script>
export default {
    computed: {
        "classComp"(){
            return { bar: false }
        },
        "classComp2"(){
            return { foo: true }
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
