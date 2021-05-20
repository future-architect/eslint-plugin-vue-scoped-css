import type { RuleContext, AST, TokenStore, Rule, RuleFixer } from "../types"
import {
    getStyleContexts,
    isValidStyleContext,
    getCommentDirectivesReporter,
} from "../styles/context"

declare const module: {
    exports: Rule
}

type StyleTypes = "plain" | "scoped" | "module"
type AllowsOption = StyleTypes[]

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
            missing: "Missing `scoped` attribute.",
            forbidden: "`scoped` attribute is forbidden.",
            add: "Add `{{ attribute }}` attribute.",
            remove: "Remove `{{ attribute }}` attribute.",
            change:
                "Change `{{ fromAttribute }}` to `{{ toAttribute }}` attribute.",
            forbiddenStyle: "`{{ attribute }}` attribute is forbidden.",
            forbiddenPlain: "Missing atributes {{ attributes }}.",
        },
        schema: [
            {
                anyOf: [
                    // deprecated
                    {
                        enum: ["always", "never"],
                    },
                    {
                        type: "object",
                        properties: {
                            allows: {
                                type: "array",
                                minItems: 1,
                                uniqueItems: true,
                                items: {
                                    type: "string",
                                    enum: ["plain", "scoped", "module"],
                                },
                            },
                        },
                        additionalProperties: false,
                    },
                ],
            },
        ],
        type: "suggestion",
    },
    create(context: RuleContext) {
        const styles = getStyleContexts(context).filter(isValidStyleContext)
        if (!styles.length) {
            return {}
        }

        const reporter = getCommentDirectivesReporter(context)
        const tokenStore = context.parserServices.getTemplateBodyTokenStore?.() as TokenStore
        const { options } = context

        if (typeof options[0] === "object") {
            const allows: AllowsOption = options[0]?.allows ?? ["scoped"]

            /**
             * Reports the given node.
             * @param {ASTNode} node node to report
             * @param {ASTNode} attribute type of style
             */
            function reportForbiddenStyle( // eslint-disable-line no-inner-declarations -- conditional report function
                node: AST.VElement,
                attribute: StyleTypes,
            ) {
                const singleAllow = allows.length === 1 && allows[0]
                const forbiddenAttr = node.startTag.attributes.find(
                    (attr) => attr.key.name === attribute,
                )
                const forbiddenAttrName = forbiddenAttr!.key.name as string

                reporter.report({
                    node: forbiddenAttr!,
                    messageId: "forbiddenStyle",
                    data: {
                        attribute,
                    },
                    suggest: [
                        singleAllow && singleAllow !== "plain"
                            ? {
                                  messageId: "change",
                                  data: {
                                      fromAttribute: forbiddenAttrName,
                                      toAttribute: singleAllow,
                                  },
                                  fix(fixer: RuleFixer) {
                                      return fixer.replaceText(
                                          forbiddenAttr,
                                          singleAllow,
                                      )
                                  },
                              }
                            : {
                                  messageId: "remove",
                                  data: {
                                      attribute: forbiddenAttrName,
                                  },
                                  fix(fixer: RuleFixer) {
                                      return fixer.remove(forbiddenAttr)
                                  },
                              },
                    ],
                })
            }

            /* eslint-disable no-inner-declarations -- conditional report function */
            /**
             * Reports the given node.
             * @param {ASTNode} node node to report
             */
            function reportForbiddenPlain(node: AST.VElement) {
                const singleAllow = allows.length === 1 && allows[0]

                reporter.report({
                    node: node.startTag,
                    messageId: "forbiddenPlain",
                    data: {
                        attribute: allows
                            .map((allow) => `\`${allow}\``)
                            .join(", "),
                    },
                    suggest: singleAllow
                        ? [
                              {
                                  messageId: "add",
                                  data: {
                                      attribute: singleAllow,
                                  },
                                  fix(fixer: RuleFixer) {
                                      const close = tokenStore.getLastToken(
                                          node.startTag,
                                      )
                                      return (
                                          close &&
                                          fixer.insertTextBefore(
                                              close,
                                              ` ${singleAllow}`,
                                          )
                                      )
                                  },
                              },
                          ]
                        : undefined,
                })
            }
            /* eslint-enable no-inner-declarations -- conditional report function */

            return {
                "Program:exit"() {
                    for (const style of styles) {
                        if (style.scoped && style.module) {
                            // report error can't have both
                        } else if (style.scoped) {
                            if (!allows.includes("scoped")) {
                                reportForbiddenStyle(
                                    style.styleElement,
                                    "scoped",
                                )
                            }
                        } else if (style.module) {
                            if (!allows.includes("module")) {
                                reportForbiddenStyle(
                                    style.styleElement,
                                    "module",
                                )
                            }
                        } else {
                            if (!allows.includes("plain")) {
                                reportForbiddenPlain(style.styleElement)
                            }
                        }
                    }
                },
            }
        }

        const always = options[0] !== "never"

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
                        data: {
                            attribute: "scoped",
                        },
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
            const scopedAttrName = scopedAttr?.key.name as string

            reporter.report({
                node: scopedAttr!,
                messageId: "forbidden",
                data: {},
                suggest: [
                    {
                        messageId: "remove",
                        data: {
                            attribute: scopedAttrName,
                        },
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
