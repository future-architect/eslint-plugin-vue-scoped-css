<script>
export default {
    computed: {
        classComp: {
            get () {
                return { bar: false }
            }
        },
        classComp2: {
            get () {
                return  { foo: false }
            }
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
