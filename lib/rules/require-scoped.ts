import type { RuleContext, AST, TokenStore, Rule, RuleFixer } from "../types"
import {
    getStyleContexts,
    isValidStyleContext,
    getCommentDirectivesReporter,
} from "../styles/context"

declare const module: {
    exports: Rule
}

module.exports = {
    meta: {
        deprecated: true,
        docs: {
            description:
                "enforce the `<style>` tags to has the `scoped` attribute",
            categories: ["recommended", "vue3-recommended"],
            default: "warn",
            url:
                "https://future-architect.github.io/eslint-plugin-vue-scoped-css/rules/require-scoped.html",
            suggestion: true,
            replacedBy: ["enforce-style-type"],
        },
        fixable: null,
        messages: {
            missing: "Missing `scoped` attribute.",
            forbidden: "`scoped` attribute are forbidden.",
            add: "Add `scoped` attribute.",
            remove: "Remove `scoped` attribute.",
        },
        schema: [{ enum: ["always", "never"] }],
        type: "suggestion",
        hasSuggestions: true,
    },
    create(context: RuleContext) {
        const always = context.options[0] !== "never"
        const styles = getStyleContexts(context).filter(isValidStyleContext)
        if (!styles.length) {
            return {}
        }
        const reporter = getCommentDirectivesReporter(context)
        const tokenStore = context.parserServices.getTemplateBodyTokenStore?.() as TokenStore

        /**
         * Reports the given node.
         * @param {ASTNode} node node to report
         */
        function reportAlways(node: AST.VElement) {
            reporter.report({
                node: node.startTag,
                messageId: "missing",
                data: {},
                suggest: [
                    {
                        messageId: "add",
                        fix(fixer: RuleFixer) {
                            const close = tokenStore.getLastToken(node.startTag)
                            return (
                                close &&
                                fixer.insertTextBefore(close, " scoped")
                            )
                        },
                    },
                ],
            })
        }

        /**
         * Reports the given node.
         * @param {ASTNode} node node to report
         */
        function reportNever(node: AST.VElement) {
            const scopedAttr = node.startTag.attributes.find(
                (attr) => attr.key.name === "scoped",
            )
            reporter.report({
                node: scopedAttr!,
                messageId: "forbidden",
                data: {},
                suggest: [
                    {
                        messageId: "remove",
                        fix(fixer: RuleFixer) {
                            return fixer.remove(scopedAttr)
                        },
                    },
                ],
            })
        }

        return {
            "Program:exit"() {
                for (const style of styles) {
                    if (always && !style.scoped) {
                        reportAlways(style.styleElement)
                    } else if (!always && style.scoped) {
                        reportNever(style.styleElement)
                    }
                }
            },
        }
    },
}
