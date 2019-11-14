<script>
export default {
    computed: {
        ...classCompSpreed,
        classComp2(){
            return { bar: false }
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
