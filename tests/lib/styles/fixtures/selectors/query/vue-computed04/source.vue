<script>
export default {
    computed: {
        // eslint-disable-next-line arrow-body-style, object-shorthand
        classComp: () => {
            return { bar: false }
        },
        // eslint-disable-next-line arrow-body-style, object-shorthand
        classComp2: () => {
            return  { foo: false }
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
