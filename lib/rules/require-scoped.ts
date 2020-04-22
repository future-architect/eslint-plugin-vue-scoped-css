import { RuleContext, AST, TokenStore } from "../types"
import { Rule } from "eslint"
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
            forbidden: "`scoped` attribute are forbidden.",
            add: "Add `scoped` attribute.",
            remove: "Remove `scoped` attribute.",
        },
        schema: [{ enum: ["always", "never"] }],
        type: "suggestion",
    },
    create(context: RuleContext) {
        const always = context.options[0] !== "never"
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
        function reportAlways(node: AST.VElement) {
            reporter.report({
                node: node.startTag,
                messageId: "missing",
                data: {},
                suggest: [
                    {
                        messageId: "add",
                        fix(fixer: Rule.RuleFixer) {
                            const close = tokenStore.getLastToken(node.startTag)
                            return (
                                close &&
                                fixer.insertTextBefore(
                                    // @ts-ignore
                                    close,
                                    " scoped",
                                )
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
                attr => attr.key.name === "scoped",
            )
            reporter.report({
                node: scopedAttr!,
                messageId: "forbidden",
                data: {},
                suggest: [
                    {
                        messageId: "remove",
                        fix(fixer: Rule.RuleFixer) {
                            return fixer.remove(
                                // @ts-ignore
                                scopedAttr,
                            )
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
