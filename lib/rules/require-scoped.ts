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
            forbiddenScoped: "`scoped` attribute is forbidden.",
            forbiddenModule: "`module` attribute is forbidden.",
            addScoped: "Add `scoped` attribute.",
            changeToScoped: "Change `module` attribute to `scoped`.",
            removeScoped: "Remove `scoped` attribute.",
            removeModule: "Remove `module` attribute.",
        },
        schema: [
            { enum: ["always", "never"] },
            {
                type: "object",
                properties: {
                    acceptCssModules: {
                        type: "boolean",
                    },
                },
                additionalProperties: false,
            },
        ],
        type: "suggestion",
    },
    create(context: RuleContext) {
        const always = context.options[0] !== "never"
        const acceptCssModules = context.options[1]?.acceptCssModules
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
        function reportAlways(node: AST.VElement, hasModule?: boolean) {
            const suggestion = hasModule
                ? {
                      messageId: "changeToScoped",
                      fix(fixer: RuleFixer) {
                          const moduleAttr = node.startTag.attributes.find(
                              (attr) => attr.key.name === "module",
                          )
                          return fixer.replaceText(moduleAttr, "scoped")
                      },
                  }
                : {
                      messageId: "addScoped",
                      fix(fixer: RuleFixer) {
                          const close = tokenStore.getLastToken(node.startTag)
                          return (
                              close && fixer.insertTextBefore(close, " scoped")
                          )
                      },
                  }

            reporter.report({
                node: node.startTag,
                messageId: "missingScoped",
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
                    if (always && !style.scoped) {
                        if (acceptCssModules && !style.module) {
                            reportAlways(style.styleElement)
                        } else if (!acceptCssModules) {
                            reportAlways(
                                style.styleElement,
                                Boolean(style.module),
                            )
                        }
                    } else if (!always) {
                        if (style.scoped) {
                            reportNever(style.styleElement)
                        } else if (acceptCssModules) {
                            reportNever(
                                style.styleElement,
                                Boolean(style.module),
                            )
                        }
                    }
                }
            },
        }
    },
}
