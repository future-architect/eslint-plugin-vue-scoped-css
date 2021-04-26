import type { RuleContext, AST, TokenStore, Rule, RuleFixer } from "../types"
import {
    getStyleContexts,
    isValidStyleContext,
    getCommentDirectivesReporter,
} from "../styles/context"

declare const module: {
    exports: Rule
}

type ModuleOption = undefined | "accept" | "enforce"

module.exports = {
    meta: {
        docs: {
            description:
                "enforce the `<style>` tags to has the `scoped` attribute",
            categories: ["recommended", "vue3-recommended"],
            default: "warn",
            url:
                "https://future-architect.github.io/eslint-plugin-vue-scoped-css/rules/require-scoped.html",
            suggestion: true,
        },
        fixable: null,
        messages: {
            missingScoped: "Missing `scoped` attribute.",
            missingModule: "Missing `module` attribute.",
            forbiddenScoped: "`scoped` attribute is forbidden.",
            forbiddenModule: "`module` attribute is forbidden.",
            addScoped: "Add `scoped` attribute.",
            addModule: "Add `module` attribute.",
            changeToScoped: "Change `module` attribute to `scoped`.",
            changeToModule: "Change `scoped` attribute to `module`.",
            removeScoped: "Remove `scoped` attribute.",
            removeModule: "Remove `module` attribute.",
        },
        schema: [
            { enum: ["always", "never"] },
            {
                type: "object",
                properties: {
                    module: {
                        enum: ["accept", "enforce"],
                    },
                },
                additionalProperties: false,
            },
        ],
        type: "suggestion",
    },
    create(context: RuleContext) {
        const always = context.options[0] !== "never"
        const moduleOption: ModuleOption = context.options[1]?.module
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
        function reportAlways(node: AST.VElement, enforceModule?: boolean) {
            const moduleAttr = node.startTag.attributes.find(
                (attr) => attr.key.name === "module",
            )
            const scopedAttr = node.startTag.attributes.find(
                (attr) => attr.key.name === "scoped",
            )

            let suggestion
            if (moduleAttr && !enforceModule) {
                suggestion = {
                    messageId: "changeToScoped",
                    fix(fixer: RuleFixer) {
                        return fixer.replaceText(moduleAttr, "scoped")
                    },
                }
            } else if (scopedAttr && enforceModule) {
                suggestion = {
                    messageId: "changeToModule",
                    fix(fixer: RuleFixer) {
                        return fixer.replaceText(scopedAttr, "module")
                    },
                }
            } else {
                suggestion = {
                    messageId: enforceModule ? "addModule" : "addScoped",
                    fix(fixer: RuleFixer) {
                        const close = tokenStore.getLastToken(node.startTag)
                        return (
                            close &&
                            fixer.insertTextBefore(
                                close,
                                enforceModule ? " module" : " scoped",
                            )
                        )
                    },
                }
            }

            reporter.report({
                node: node.startTag,
                messageId: enforceModule ? "missingModule" : "missingScoped",
                data: {},
                suggest: [suggestion],
            })
        }

        /**
         * Reports the given node.
         * @param {ASTNode} node node to report
         */
        function reportNever(node: AST.VElement, hasModule?: boolean) {
            const attrName = hasModule ? "module" : "scoped"
            const attrNode = node.startTag.attributes.find(
                (attr) => attr.key.name === attrName,
            )
            reporter.report({
                node: attrNode!,
                messageId: hasModule ? "forbiddenModule" : "forbiddenScoped",
                data: {},
                suggest: [
                    {
                        messageId: hasModule ? "removeModule" : "removeScoped",
                        fix(fixer: RuleFixer) {
                            return fixer.remove(attrNode)
                        },
                    },
                ],
            })
        }

        return {
            "Program:exit"() {
                for (const style of styles) {
                    if (always) {
                        if (moduleOption === "enforce") {
                            if (!style.module) {
                                reportAlways(style.styleElement, true)
                            }
                        } else if (moduleOption === "accept") {
                            if (!style.scoped && !style.module) {
                                reportAlways(style.styleElement, false)
                            }
                        } else if (!style.scoped) {
                            reportAlways(style.styleElement, false)
                        }
                    } else {
                        if (moduleOption === "enforce") {
                            if (style.module) {
                                reportNever(style.styleElement, true)
                            }
                        } else if (moduleOption === "accept" && style.scoped) {
                            reportNever(style.styleElement)
                        } else if (style.scoped) {
                            reportNever(style.styleElement)
                        }
                    }
                }
            },
        }
    },
}
