import { Rule } from "../types"

const baseRules = [
    {
        rule: require("../rules/no-parsing-error"),
        ruleName: "no-parsing-error",
        ruleId: "vue-scoped-css/no-parsing-error",
    },
    {
        rule: require("../rules/no-unused-keyframes"),
        ruleName: "no-unused-keyframes",
        ruleId: "vue-scoped-css/no-unused-keyframes",
    },
    {
        rule: require("../rules/no-unused-selector"),
        ruleName: "no-unused-selector",
        ruleId: "vue-scoped-css/no-unused-selector",
    },
    {
        rule: require("../rules/require-scoped"),
        ruleName: "require-scoped",
        ruleId: "vue-scoped-css/require-scoped",
    },
    {
        rule: require("../rules/require-selector-used-inside"),
        ruleName: "require-selector-used-inside",
        ruleId: "vue-scoped-css/require-selector-used-inside",
    },
]

export const rules = baseRules.map(obj => {
    const rule = obj.rule
    rule.meta.docs.ruleName = obj.ruleName
    rule.meta.docs.ruleId = obj.ruleId
    return rule as Rule
})

/**
 * Collect the rules
 * @param {string} category category
 * @returns {Array} rules
 */
export function collectRules(category?: string): { [key: string]: string } {
    return rules.reduce((obj, rule) => {
        if (
            (!category || rule.meta.docs.category === category) &&
            !rule.meta.deprecated
        ) {
            obj[rule.meta.docs.ruleId || ""] = rule.meta.docs.default || "error"
        }
        return obj
    }, {} as { [key: string]: string })
}
