<script>
export default {
    computed:{
        classComp() {
            return ["foo"]
        },
        classComp2() {
            return {
                // eslint-disable-next-line no-useless-computed-key
                ["foo"]: false
            }
        },
        classComp3() {
            return {
                // eslint-disable-next-line no-useless-computed-key
                ["bar"]: false
            }
        }
    },
}
</script>
<template>
    <ul>
        <li id="a" :class="classComp" />
        <li id="b" :class="classComp2" />
        <li id="c" :class="classComp3" />
    </ul>
</template>
<style scoped>
.foo {
}
.bar {
}
</style>
