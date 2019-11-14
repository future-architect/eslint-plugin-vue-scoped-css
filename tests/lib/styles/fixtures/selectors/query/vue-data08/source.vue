<script>
export default {
    data () {
        return {
            [this.comp]: "bar"
        }
    }
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
