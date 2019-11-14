import { rules } from "./utils/rules"
import { Rule } from "./types"

const allRules = rules.reduce((obj, r) => {
    obj[r.meta.docs.ruleName] = r
    return obj
}, {} as { [key: string]: Rule })

export = {
    configs: {
        base: require("./configs/base"),
        recommended: require("./configs/recommended"),
        all: require("./configs/all"),
    },
    rules: allRules,
}
