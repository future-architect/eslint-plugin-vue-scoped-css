const categories = require("./categories")
// eslint-disable-next-line node/no-extraneous-require -- demo
const webpack = require("webpack")
const path = require("path")

module.exports = {
    base: "/eslint-plugin-vue-scoped-css/",
    title: "eslint-plugin-vue-scoped-css",
    description: "ESLint plugin for Scoped CSS in Vue.js.",
    serviceWorker: true,
    evergreen: true,
    configureWebpack(_config, _isServer) {
        return {
            resolve: {
                alias: {
                    eslint: path.resolve(__dirname, "./shim/eslint"),
                    // eslint-disable-next-line node/no-extraneous-require -- demo
                    stylus: require.resolve("stylus/lib/stylus"),
                    glob: require.resolve("./shim/glob"),
                    "safer-buffer": require.resolve("./shim/safer-buffer"),
                    module: require.resolve("./shim/module"),
                    postcss$: require.resolve("postcss/lib/postcss.mjs"),
                },
            },
            plugins: [
                new webpack.DefinePlugin({
                    "process.version": JSON.stringify("v12.13.0"),
                }),
            ],
        }
    },

    head: [
        // ["link", { rel: "icon", type: "image/png", href: "/logo.png" }]
    ],
    themeConfig: {
        // logo: "/logo.svg",
        repo: "future-architect/eslint-plugin-vue-scoped-css",
        docsRepo: "future-architect/eslint-plugin-vue-scoped-css",
        docsDir: "docs",
        docsBranch: "master",
        editLinks: true,
        lastUpdated: true,
        serviceWorker: {
            updatePopup: true,
        },

        nav: [
            { text: "Introduction", link: "/" },
            { text: "User Guide", link: "/user-guide/" },
            { text: "Rules", link: "/rules/" },
            { text: "Playground", link: "/playground/" },
        ],

        sidebar: {
            "/rules/": [
                "/rules/",

                // Rules in each category.
                ...categories
                    .map(({ title, rules: catRules }) => ({
                        title: title.replace(/ \(.+?\)/u, ""),
                        collapsable: false,
                        children: catRules.map(
                            ({
                                meta: {
                                    docs: { ruleId, ruleName },
                                },
                            }) => [`/rules/${ruleName}`, ruleId],
                        ),
                    }))
                    .filter((menu) => Boolean(menu.children.length)),
            ],
            "/": ["/", "/user-guide/", "/rules/", "/playground/"],
        },
    },
}
