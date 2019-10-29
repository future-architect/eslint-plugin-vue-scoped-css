<script>
export default {
    data () {
        return {
            prop: "t"
        }
    },
}
</script>
<template>
    <div id="example-2">
        <button @click="show = !show">
            Toggle show
        </button>
        <transition>
            <p v-if="show" id="a">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris facilisis enim libero, at lacinia diam fermentum id. Pellentesque habitant morbi tristique senectus et netus.
            </p>
        </transition>
        <transition name="custom">
            <p v-if="show" id="b">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris facilisis enim libero, at lacinia diam fermentum id. Pellentesque habitant morbi tristique senectus et netus.
            </p>
        </transition>
        <transition :name="prop">
            <p v-if="show" id="c">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris facilisis enim libero, at lacinia diam fermentum id. Pellentesque habitant morbi tristique senectus et netus.
            </p>
        </transition>
    </div>
</template>
<style scoped>
.t-enter {
}
.t-enter-active{
}
.t-enter-to{
}
.t-leave{
}
.t-leave-active{
}
.t-leave-to{
}
</style>
