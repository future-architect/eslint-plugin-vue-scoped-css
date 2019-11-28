import { VCSSAtRule, VCSSDeclarationProperty } from "../styles/ast"
import { RuleContext } from "../types"
import { Template } from "../styles/template"
import {
    getStyleContexts,
    getCommentDirectivesReporter,
    ValidStyleContext,
    StyleContext,
} from "../styles/context"

module.exports = {
    meta: {
        docs: {
            description: "Reports the `@keyframes` is not used in Scoped CSS.",
            category: "recommended",
            default: "warn",
            url:
                "https://future-architect.github.io/eslint-plugin-vue-scoped-css/rules/no-unused-keyframes.html",
        },
        fixable: null,
        messages: {
            unused: "The @keyframes `{{params}}` is unused.",
        },
        schema: [],
        type: "suggestion", // "problem",
    },
    create(context: RuleContext) {
        const styles = getStyleContexts(context)
            .filter(StyleContext.isValid)
            .filter(style => style.scoped)
        if (!styles.length) {
            return {}
        }
        const reporter = getCommentDirectivesReporter(context)
        const sourceCode = context.getSourceCode()

        /**
         * Reports the given node
         * @param {ASTNode} node node to report
         */
        function report(node: VCSSAtRule) {
            const paramsStartIndex =
                node.range[0] + // start index of at-rule
                node.identifier.length + // `@`
                node.name.length + // `nest`
                (node.node.raws.afterName || "").length // comments and spaces
            const paramsEndIndex = paramsStartIndex + node.rawParamsText.length
            reporter.report({
                node,
                loc: {
                    start: sourceCode.getLocFromIndex(paramsStartIndex),
                    end: sourceCode.getLocFromIndex(paramsEndIndex),
                },
                messageId: "unused",
                data: { params: node.paramsText },
            })
        }

        /**
         * Extract nodes
         */
        function extract(
            style: ValidStyleContext,
        ): {
            keyframes: { node: VCSSAtRule; params: Template }[]
            animationNames: VCSSDeclarationProperty[]
            animations: VCSSDeclarationProperty[]
        } {
            const keyframes: { node: VCSSAtRule; params: Template }[] = []
            const animationNames: VCSSDeclarationProperty[] = []
            const animations: VCSSDeclarationProperty[] = []
            style.traverseNodes({
                enterNode(node) {
                    if (node.type === "VCSSAtRule") {
                        if (
                            /-?keyframes$/u.test(node.name) &&
                            node.identifier === "@"
                        ) {
                            // register keyframes
                            keyframes.push({
                                params: Template.ofParams(node),
                                node,
                            })
                        }
                    } else if (node.type === "VCSSDeclarationProperty") {
                        // individual animation-name declaration
                        if (/^(-\w+-)?animation-name$/u.test(node.property)) {
                            animationNames.push(node)
                        }
                        // shorthand
                        if (/^(-\w+-)?animation$/u.test(node.property)) {
                            animations.push(node)
                        }
                    }
                },
                leaveNode() {
                    // noop
                },
            })
            return {
                keyframes,
                animationNames,
                animations,
            }
        }

        /**
         * Verify the style
         */
        function verify(style: ValidStyleContext) {
            const { keyframes, animationNames, animations } = extract(style)

            for (const decl of animationNames) {
                for (const v of decl.value.split(",").map(s => s.trim())) {
                    const value = Template.ofDeclValue(v, decl.lang)
                    for (
                        let index = keyframes.length - 1;
                        index >= 0;
                        index--
                    ) {
                        const { params } = keyframes[index]
                        if (value.match(params)) {
                            keyframes.splice(index, 1)
                        }
                    }
                }
            }

            for (const decl of animations) {
                for (const v of decl.value.split(",").map(s => s.trim())) {
                    const vals = v.trim().split(/\s+/u)
                    for (const val of vals) {
                        const value = Template.ofDeclValue(val, decl.lang)
                        for (
                            let index = keyframes.length - 1;
                            index >= 0;
                            index--
                        ) {
                            const { params } = keyframes[index]
                            if (value.match(params)) {
                                keyframes.splice(index, 1)
                            }
                        }
                    }
                }
            }

            for (const { node } of keyframes) {
                report(node)
            }
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
