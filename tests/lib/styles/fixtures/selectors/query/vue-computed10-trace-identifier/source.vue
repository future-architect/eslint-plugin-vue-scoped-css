<script>
const CLASS_NAME_FOO = "foo";
const CLASS_NAME_BAR = bar();
export default {
    computed:{
        classComp() {
            return [CLASS_NAME_FOO,]
        },
        classComp2() {
            return {
                [CLASS_NAME_FOO]: false
            }
        },
        classComp3() {
            return {
                [CLASS_NAME_BAR]: false
            }
        },
        classComp4() {
            return [
                {
                    [CLASS_NAME_FOO]: false
                }
            ]
        },
    },
}
</script>
<template>
    <ul>
        <li id="a" :class="classComp" />
        <li id="b" :class="classComp2" />
        <li id="c" :class="classComp3" />
        <li id="d" :class="classComp4" />
    </ul>
</template>
<style scoped>
.foo {
}
.bar {
}
</style>
