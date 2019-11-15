<template>
    <div class="sns-bar">
        <div class="sns">
            <a
                class="github-button"
                href="https://github.com/future-architect/eslint-plugin-vue-scoped-css"
                data-show-count="true"
                aria-label="Star future-architect/eslint-plugin-vue-scoped-css on GitHub"
                >Star</a
            >
            <a
                href="https://twitter.com/share"
                class="twitter-share-button"
                data-url="https://future-architect.github.io/eslint-plugin-vue-scoped-css/"
                >Tweet</a
            >
            <div
                class="fb-like"
                data-href="https://future-architect.github.io/eslint-plugin-vue-scoped-css/"
                data-layout="button_count"
                data-action="like"
                data-size="small"
                data-show-faces="false"
                data-share="true"
            />
            <a
                href="https://www.npmjs.com/package/eslint-plugin-vue-scoped-css"
            >
                <img
                    src="https://img.shields.io/npm/v/eslint-plugin-vue-scoped-css.svg"
                    alt="npm"
                />
            </a>
        </div>
    </div>
</template>

<script>
let timeoutId = null

function setup() {
    if (timeoutId) {
        clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
        ;(function(d, s, id) {
            const [fjs] = d.getElementsByTagName(s)
            if (d.getElementById(id)) {
                return
            }
            const js = d.createElement(s)
            js.id = id
            js.src = "https://buttons.github.io/buttons.js"
            fjs.parentNode.insertBefore(js, fjs)
        })(document, "script", "gh-buttons")
        ;(function(d, s, id) {
            const [fjs] = d.getElementsByTagName(s)
            if (d.getElementById(id)) {
                return
            }
            const js = d.createElement(s)
            js.id = id
            js.src =
                "https://connect.facebook.net/ja_JP/sdk.js#xfbml=1&version=v2.10"
            fjs.parentNode.insertBefore(js, fjs)
        })(document, "script", "facebook-jssdk")
        ;(function(d, s, id) {
            const [fjs] = d.getElementsByTagName(s)
            const p = /^http:/u.test(d.location) ? "http" : "https"
            if (!d.getElementById(id)) {
                const js = d.createElement(s)
                js.id = id
                js.src = `${p}://platform.twitter.com/widgets.js`
                fjs.parentNode.insertBefore(js, fjs)
            }
        })(document, "script", "twitter-wjs")
    }, 500)
}

export default {
    name: "SnsBar",
    mounted() {
        setup()
    },
}
</script>

<style scoped lang="postcss">
.sns-bar .sns {
    display: flex;
    align-items: flex-start;
}

.sns-bar >>> .sns > * {
    vertical-align: top !important;
    margin-left: 4px;
    height: 23px !important;
}
</style>
