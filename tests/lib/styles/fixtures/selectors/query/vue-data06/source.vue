<script>
export default {
    data () {
        return this.unknown
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
