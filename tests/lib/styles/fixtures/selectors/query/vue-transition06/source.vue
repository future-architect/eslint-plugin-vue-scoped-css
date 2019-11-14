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
        <transition
            name="custom"
            enter-class="ec"
            enter-active-class="eac"
            enter-to-class="etc"
        >
            <p v-if="show" id="c">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris facilisis enim libero, at lacinia diam fermentum id. Pellentesque habitant morbi tristique senectus et netus.
            </p>
        </transition>
        <transition
            name="custom"
            leave-class="lc"
            leave-active-class="lac"
            leave-to-class="ltc"
        >
            <p v-if="show" id="d">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris facilisis enim libero, at lacinia diam fermentum id. Pellentesque habitant morbi tristique senectus et netus.
            </p>
        </transition>
    </div>
</template>
<style scoped>
.ec, .eac, .etc {
}
.lc, .lac, .ltc {
}
</style>
