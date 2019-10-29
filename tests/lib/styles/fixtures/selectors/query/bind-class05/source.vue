<script>
export default {
    data () {
        return {
            classData: "bar",
            classData2: "foo"
        }
    },
    computed: {
        classComp () {
            if (this.a) {
                return "foo"
            } else if (this.b) {
                return "bar"
            }
            return "baz"
        },
        classComp2 () {
            (() => "bar")()
            if (this.a) {
                return "qux"
            } else if (this.b) {
                return "quux"
            }
            return "grault"
        }
    }
}
</script>
<template>
    <ul>
        <li id="a" :class="classData" />
        <li id="b" :class="classData2" />
        <li id="c" :class="classComp" />
        <li id="d" :class="classComp2" />
        <li id="e" :class="unknown" />
        <li id="f" :class="['foo',classData,]" />
        <li id="g" :class="classComp.unknownProp" />
    </ul>
</template>
<style scoped>
.bar {
}
</style>
