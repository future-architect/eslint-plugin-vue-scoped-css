import type { Rule } from "../types"

const baseRules = [
    {
        rule: require("../rules/no-deprecated-deep-combinator"),
        ruleName: "no-deprecated-deep-combinator",
        ruleId: "vue-scoped-css/no-deprecated-deep-combinator",
    },
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
    {
        rule: require("../rules/require-v-deep-arguments"),
        ruleName: "require-v-deep-arguments",
        ruleId: "vue-scoped-css/require-v-deep-arguments",
    },
]

export const rules = baseRules.map((obj) => {
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
export function collectRules(
    category?: "recommended" | "vue3-recommended",
): { [key: string]: string } {
    return rules.reduce((obj, rule) => {
        if (
            (!category || rule.meta.docs.categories.includes(category)) &&
            !rule.meta.deprecated
        ) {
            obj[rule.meta.docs.ruleId || ""] = rule.meta.docs.default || "error"
        }
        return obj
    }, {} as { [key: string]: string })
}
