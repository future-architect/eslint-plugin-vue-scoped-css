<template>
    <div id="example-2">
        <button @click="show = !show">
            Toggle show
        </button>
        <transition-group>
            <p v-if="show" id="a">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris facilisis enim libero, at lacinia diam fermentum id. Pellentesque habitant morbi tristique senectus et netus.
            </p>
        </transition-group>
        <transition-group name="custom">
            <p v-if="show" id="b">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris facilisis enim libero, at lacinia diam fermentum id. Pellentesque habitant morbi tristique senectus et netus.
            </p>
        </transition-group>
        <transition-group :name="prop">
            <p v-if="show" id="c">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris facilisis enim libero, at lacinia diam fermentum id. Pellentesque habitant morbi tristique senectus et netus.
            </p>
        </transition-group>
    </div>
</template>
<style scoped>
.v-enter {
}
.v-enter-from {
}
.v-enter-active{
}
.v-enter-to{
}
.v-leave{
}
.v-leave-from{
}
.v-leave-active{
}
.v-leave-to{
}
.v-move {
}
</style>
