import {
    getStyleContexts,
    getCommentDirectivesReporter,
    StyleContext,
    ValidStyleContext,
} from "../styles/context"
import type { VCSSSelectorNode } from "../styles/ast"
import type { RuleContext, Rule } from "../types"
import { isVGlobalPseudo } from "../styles/utils/selectors"

declare const module: {
    exports: Rule
}

module.exports = {
    meta: {
        docs: {
            description:
                "disallow parent selector for `::v-global` pseudo-element",
            categories: ["vue3-recommended"],
            default: "warn",
            url:
                "https://future-architect.github.io/eslint-plugin-vue-scoped-css/rules/no-parent-of-v-global.html",
        },
        fixable: null,
        messages: {
            unexpected:
                "The parent selector of the `::v-global()` pseudo-element is useless.",
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
        function report(node: VCSSSelectorNode) {
            reporter.report({
                node,
                loc: node.loc,
                messageId: "unexpected",
            })
        }

        /**
         * Verify the style
         */
        function verify(style: ValidStyleContext) {
            style.traverseSelectorNodes({
                enterNode(node) {
                    if (!isVGlobalPseudo(node)) {
                        return
                    }
                    const nodes = node.parent.nodes
                    const selectorIndex = nodes.indexOf(node)
                    if (selectorIndex > 0) {
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
