import {
    getStyleContexts,
    getCommentDirectivesReporter,
    StyleContext,
    ValidStyleContext,
} from "../styles/context"
import type { VCSSSelectorCombinator } from "../styles/ast"
import type { RuleContext, Rule } from "../types"
import { isDeepCombinator } from "../styles/utils/selectors"

declare const module: {
    exports: Rule
}

module.exports = {
    meta: {
        docs: {
            description: "disallow using deprecated deep combinators",
            categories: ["vue3-recommended"],
            default: "warn",
            url:
                "https://future-architect.github.io/eslint-plugin-vue-scoped-css/rules/no-deprecated-deep-combinator.html",
        },
        fixable: null,
        messages: {
            deprecated: "The deep combinator `{{value}}` is deprecated.",
        },
        schema: [],
        type: "suggestion", // "problem",
    },
    create(context: RuleContext) {
        const styles = getStyleContexts(context)
            .filter(StyleContext.isValid)
            .filter((style) => style.scoped)
        if (!styles.length) {
            return {}
        }
        const reporter = getCommentDirectivesReporter(context)

        /**
         * Reports the given node
         * @param {ASTNode} node node to report
         */
        function report(node: VCSSSelectorCombinator) {
            reporter.report({
                node,
                loc: node.loc,
                messageId: "deprecated",
                data: {
                    value: node.value.trim(),
                },
            })
        }

        /**
         * Verify the style
         */
        function verify(style: ValidStyleContext) {
            style.traverseSelectorNodes({
                enterNode(node) {
                    if (isDeepCombinator(node)) {
                        report(node)
                    }
                },
            })
        }

        return {
            "Program:exit"() {
                for (const style of styles) {
                    verify(style)
                }
            },
        }
    },
}
