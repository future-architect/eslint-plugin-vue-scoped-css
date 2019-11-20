import { Linter } from "eslint"
import parser = require("babel-eslint")
import plugin = require("../../lib/index")

describe("Don't crash even if without vue-eslint-parser.", () => {
    const code = "<style scoped>.a {}</style>"

    for (const key of Object.keys(plugin.rules)) {
        const ruleId = `vue-scoped-css/${key}`

        it(ruleId, () => {
            const linter = new Linter()
            const config = {
                parser: "babel-eslint",
                parserOptions: { ecmaVersion: 2015 },
                rules: {
                    [ruleId]: "error",
                },
            }
            linter.defineParser("babel-eslint", parser)
            linter.defineRule(ruleId, plugin.rules[key] as any)
            linter.verifyAndFix(code, config as any, "test.vue")
        })
    }
})
