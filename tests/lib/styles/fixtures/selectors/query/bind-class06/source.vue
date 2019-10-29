<script>
export default {
    data () {
        return {
            classData: {bar:false},
            classData2: {foo:this.foo}
        }
    },
    computed: {
        classComp () {
            if (this.a) {
                return {foo:this.foo}
            } else if (this.b) {
                return {bar:this.bar}
            }
            return {baz:false}
        },
        classComp2 () {
            if (this.a) {
                return {qux:true}
            } else if (this.b) {
                return {quux:true}
            }
            return {grault:true}
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
