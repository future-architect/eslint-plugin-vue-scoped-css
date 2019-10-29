<script>
export default {
    data () {
        return {
            idData: "b",
            idData2: "a"
        }
    },
    computed: {
        idComp () {
            if (this.a) {
                return "a"
            } else if (this.b) {
                return "b"
            }
            return "c"
        },
        idComp2 () {
            if (this.a) {
                return "d"
            } else if (this.b) {
                return "e"
            }
            return "f"
        }
    }
}
</script>
<template>
    <ul>
        <li :id="'a'" class="foo" />
        <li :id="idData" class="bar" />
        <li :id="idData2" class="baz" />
        <li :id="idComp" class="qux" />
        <li :id="idComp2" class="quux" />
        <li :id="unknown" class="corge" />
    </ul>
</template>
<style scoped>
#b {
}
</style>
