import type { Rule } from "../types";
import enforceStyleType from "../rules/enforce-style-type";
import noDeprecatedDeepCombinator from "../rules/no-deprecated-deep-combinator";
import noDeprecatedVEnterVLeaveClass from "../rules/no-deprecated-v-enter-v-leave-class";
import noParentOfVGlobal from "../rules/no-parent-of-v-global";
import noParsingError from "../rules/no-parsing-error";
import noUnusedKeyframes from "../rules/no-unused-keyframes";
import noUnusedSelector from "../rules/no-unused-selector";
import requireScoped from "../rules/require-scoped";
import requireSelectorUsedInside from "../rules/require-selector-used-inside";
import requireVDeepArgument from "../rules/require-v-deep-argument";
import requireVGlobalArgument from "../rules/require-v-global-argument";
import requireVSlottedArgument from "../rules/require-v-slotted-argument";
import vDeepPseudoStyle from "../rules/v-deep-pseudo-style";
import vGlobalPseudoStyle from "../rules/v-global-pseudo-style";
import vSlottedPseudoStyle from "../rules/v-slotted-pseudo-style";

const baseRules = [
  {
    rule: enforceStyleType,
    ruleName: "enforce-style-type",
    ruleId: "vue-scoped-css/enforce-style-type",
  },
  {
    rule: noDeprecatedDeepCombinator,
    ruleName: "no-deprecated-deep-combinator",
    ruleId: "vue-scoped-css/no-deprecated-deep-combinator",
  },
  {
    rule: noDeprecatedVEnterVLeaveClass,
    ruleName: "no-deprecated-v-enter-v-leave-class",
    ruleId: "vue-scoped-css/no-deprecated-v-enter-v-leave-class",
  },
  {
    rule: noParentOfVGlobal,
    ruleName: "no-parent-of-v-global",
    ruleId: "vue-scoped-css/no-parent-of-v-global",
  },
  {
    rule: noParsingError,
    ruleName: "no-parsing-error",
    ruleId: "vue-scoped-css/no-parsing-error",
  },
  {
    rule: noUnusedKeyframes,
    ruleName: "no-unused-keyframes",
    ruleId: "vue-scoped-css/no-unused-keyframes",
  },
  {
    rule: noUnusedSelector,
    ruleName: "no-unused-selector",
    ruleId: "vue-scoped-css/no-unused-selector",
  },
  {
    rule: requireScoped,
    ruleName: "require-scoped",
    ruleId: "vue-scoped-css/require-scoped",
  },
  {
    rule: requireSelectorUsedInside,
    ruleName: "require-selector-used-inside",
    ruleId: "vue-scoped-css/require-selector-used-inside",
  },
  {
    rule: requireVDeepArgument,
    ruleName: "require-v-deep-argument",
    ruleId: "vue-scoped-css/require-v-deep-argument",
  },
  {
    rule: requireVGlobalArgument,
    ruleName: "require-v-global-argument",
    ruleId: "vue-scoped-css/require-v-global-argument",
  },
  {
    rule: requireVSlottedArgument,
    ruleName: "require-v-slotted-argument",
    ruleId: "vue-scoped-css/require-v-slotted-argument",
  },
  {
    rule: vDeepPseudoStyle,
    ruleName: "v-deep-pseudo-style",
    ruleId: "vue-scoped-css/v-deep-pseudo-style",
  },
  {
    rule: vGlobalPseudoStyle,
    ruleName: "v-global-pseudo-style",
    ruleId: "vue-scoped-css/v-global-pseudo-style",
  },
  {
    rule: vSlottedPseudoStyle,
    ruleName: "v-slotted-pseudo-style",
    ruleId: "vue-scoped-css/v-slotted-pseudo-style",
  },
];

export const rules = baseRules.map((obj) => {
  const rule = obj.rule;
  rule.meta.docs.ruleName = obj.ruleName;
  rule.meta.docs.ruleId = obj.ruleId;
  return rule as Rule;
});

/**
 * Collect the rules
 * @param {string} category category
 * @returns {Array} rules
 */
export function collectRules(
  category?: "vue2-recommended" | "vue3-recommended",
): { [key: string]: string } {
  return rules.reduce(
    (obj, rule) => {
      if (
        (!category || rule.meta.docs.categories.includes(category)) &&
        !rule.meta.deprecated
      ) {
        obj[rule.meta.docs.ruleId || ""] = rule.meta.docs.default || "error";
      }
      return obj;
    },
    {} as { [key: string]: string },
  );
}
