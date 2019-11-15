import { getStyleContexts, getCommentDirectivesReporter } from "../styles"
import { RuleContext, AST } from "../types"

module.exports = {
    meta: {
        docs: {
            description:
                "Enforce the `<style>` tags to has the `scoped` attribute.",
            category: "recommended",
            default: "warn",
            url:
                "https://github.com/future-architect/eslint-plugin-vue-scoped-css/blob/v0.0.0/docs/rules/require-scoped.ts.md",
        },
        fixable: null,
        messages: {
            missing: "Missing `scoped` attribute.",
        },
        schema: [],
        type: "suggestion",
    },
    create(context: RuleContext) {
        const styles = getStyleContexts(context).filter(style => !style.invalid)
        if (!styles.length) {
            return {}
        }
        const reporter = getCommentDirectivesReporter(context)

        /**
         * Reports the given node.
         * @param {ASTNode} node node to report
         */
        function report(node: AST.VElement) {
            reporter.report({
                node: node.startTag,
                messageId: "missing",
                data: {},
            })
        }

        return {
            "Program:exit"() {
                for (const style of styles) {
                    if (!style.scoped) {
                        report(style.styleElement)
                    }
                }
            },
        }
    },
}
