import { RuleContext, AST, TokenStore } from "../types"
import {
    getStyleContexts,
    StyleContext,
    getCommentDirectivesReporter,
} from "../styles/context"

module.exports = {
    meta: {
        docs: {
            description:
                "Enforce the `<style>` tags to has the `scoped` attribute.",
            category: "recommended",
            default: "warn",
            url:
                "https://future-architect.github.io/eslint-plugin-vue-scoped-css/rules/require-scoped.html",
            suggestion: true,
        },
        fixable: null,
        messages: {
            missing: "Missing `scoped` attribute.",
            add: "Add `scoped` attribute.",
        },
        schema: [],
        type: "suggestion",
    },
    create(context: RuleContext) {
        const styles = getStyleContexts(context).filter(StyleContext.isValid)
        if (!styles.length) {
            return {}
        }
        const reporter = getCommentDirectivesReporter(context)
        const tokenStore = context.parserServices.getTemplateBodyTokenStore?.() as TokenStore

        /**
         * Reports the given node.
         * @param {ASTNode} node node to report
         */
        function report(node: AST.VElement) {
            reporter.report({
                node: node.startTag,
                messageId: "missing",
                data: {},
                suggest: [
                    {
                        messageId: "add",
                        fix(fixer) {
                            const close = tokenStore.getLastToken(node.startTag)
                            return close && fixer.insertTextBefore(
                                // eslint-disable-next-line @mysticatea/ts/ban-ts-ignore, spaced-comment
                                /// @ts-ignore
                                close,
                                " scoped",
                            )
                        },
                    },
                ],
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
