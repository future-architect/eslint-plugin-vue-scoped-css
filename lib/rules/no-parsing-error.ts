import { getStyleContexts, getCommentDirectivesReporter } from "../styles"
import { RuleContext } from "../types"
import { VCSSParsingError } from "../styles/ast"

module.exports = {
    meta: {
        docs: {
            description: "Disallow parsing errors in `<style>`",
            category: "recommended",
            default: "warn",
            url:
                "https://future-architect.github.io/eslint-plugin-vue-scoped-css/rules/no-parsing-error.html",
        },
        fixable: null,
        messages: {},
        schema: [],
        type: "problem",
    },
    create(context: RuleContext) {
        const styles = getStyleContexts(context).filter(style => !style.invalid)
        if (!styles.length) {
            return {}
        }
        const reporter = getCommentDirectivesReporter(context)

        /**
         * Reports the given node
         * @param {ASTNode} node node to report
         */
        function report(node: VCSSParsingError) {
            reporter.report({
                node,
                loc: node.loc.start,
                message: "Parsing error: {{message}}.",
                data: {
                    message: node.message.endsWith(".")
                        ? node.message.slice(0, -1)
                        : node.message,
                },
            })
        }

        return {
            "Program:exit"() {
                for (const style of styles) {
                    for (const node of style.cssNode?.errors || []) {
                        report(node)
                    }
                }
            },
        }
    },
}
