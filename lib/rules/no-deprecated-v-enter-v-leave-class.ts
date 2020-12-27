import {
    getStyleContexts,
    getCommentDirectivesReporter,
    isValidStyleContext,
} from "../styles/context"
import type {
    VCSSSelectorNode,
    VCSSNode,
    VCSSClassSelector,
} from "../styles/ast"
import type { RuleContext, Rule, AST } from "../types"
import {
    getElements,
    isTransitionElement,
    isTransitionGroupElement,
    findAttribute,
} from "../utils/templates"
import { getAttributeValueNodes } from "../styles/selectors/query/attribute-tracker"
import { Template } from "../styles/template"
import { isDeepCombinator, isVueSpecialPseudo } from "../styles/utils/selectors"
import { isVCSSAtRule } from "../styles/utils/css-nodes"

declare const module: {
    exports: Rule
}

module.exports = {
    meta: {
        docs: {
            description: "disallow v-enter and v-leave classes.",
            categories: [],
            default: "warn",
            url:
                "https://future-architect.github.io/eslint-plugin-vue-scoped-css/rules/no-deprecated-v-enter-v-leave-class.html",
        },
        fixable: null,
        messages: {
            deprecatedClass: "The `v-{{kind}}` class is renamed in Vue 3.",
            deprecatedProps:
                "The `{{kind}}-class` prop is renamed in Vue 3. Rename to `{{kind}}-from-class`.",
        },
        schema: [],
        type: "suggestion", // "problem",
    },
    create(context: RuleContext) {
        const styles = getStyleContexts(context)
            .filter(isValidStyleContext)
            .filter((style) => style.scoped)
        const reporter = getCommentDirectivesReporter(context)

        type Kind = "enter" | "leave"
        const deprecatedClassNames = new Map<
            string | Template,
            { className: Template; kind: Kind }
        >()
        const renamedClassNames = new Map<
            string | Template,
            { className: Template }
        >()

        /**
         * Reports the given node
         * @param {ASTNode} node node to report
         */
        function report(
            node: VCSSSelectorNode | AST.VIdentifier | AST.VDirectiveKey,
            messageId: "deprecatedClass" | "deprecatedProps",
            kind: Kind,
        ) {
            reporter.report({
                node,
                loc: node.loc,
                messageId,
                data: { kind },
            })
        }

        /**
         * Add deprecated transition class name. e.g. v-enter
         */
        function addDeprecatedClassName(className: Template, kind: Kind) {
            deprecatedClassNames.set(className.string || className, {
                className,
                kind,
            })
        }

        /**
         * Add deprecated transition class name. e.g. v-enter-fron
         */
        function addRenamedClassName(className: Template) {
            renamedClassNames.set(className.string || className, {
                className,
            })
        }

        /**
         * Verify for selector
         * @returns {boolean} true if the child hierarchy needs to be processed.
         */
        function verifyCSSSelector(selector: VCSSSelectorNode[]): boolean {
            const deprecatedClasses = new Map<VCSSClassSelector, Kind>()
            const renamedClasses = new Set<string>()
            let skipChild = false

            verifyInternal(selector)

            for (const [node, kind] of deprecatedClasses) {
                if (!renamedClasses.has(`${node.value}-from`)) {
                    report(node, "deprecatedClass", kind)
                }
            }

            return !skipChild

            /**
             * Verify
             */
            function verifyInternal(nodes: VCSSSelectorNode[]) {
                for (const node of nodes) {
                    if (isDeepCombinator(node) || isVueSpecialPseudo(node)) {
                        skipChild = true
                        break
                    }
                    if (node.type === "VCSSClassSelector") {
                        for (const {
                            className,
                            kind,
                        } of deprecatedClassNames.values()) {
                            if (className.matchString(node.value)) {
                                deprecatedClasses.set(node, kind)
                                break
                            }
                        }
                        for (const {
                            className,
                        } of renamedClassNames.values()) {
                            if (className.matchString(node.value)) {
                                renamedClasses.add(node.value)
                                break
                            }
                        }
                    } else if (
                        node.type === "VCSSSelectorPseudo" ||
                        node.type === "VCSSSelector"
                    ) {
                        verifyInternal(node.nodes)
                    }
                }
                return !skipChild
            }
        }

        /**
         * Checks whether to ignore the processing of the given node.
         */
        function isIgnoreNode(node: VCSSNode) {
            return (
                isVCSSAtRule(node) &&
                node.name === "keyframes" &&
                node.identifier === "@"
            )
        }

        /**
         * Verify for CSSNode
         */
        function verifyCSSNode(node: VCSSNode) {
            if (isIgnoreNode(node)) {
                return
            }
            if (node.type === "VCSSStyleRule") {
                if (!verifyCSSSelector(node.selectors)) {
                    return
                }
                for (const child of node.nodes) {
                    verifyCSSNode(child)
                }
            } else if (node.type === "VCSSAtRule") {
                if (node.selectors) {
                    if (!verifyCSSSelector(node.selectors)) {
                        return
                    }
                }
                for (const child of node.nodes) {
                    verifyCSSNode(child)
                }
            }
        }

        /**
         * Verify for transition element
         */
        function verifyTransitionElementNode(node: AST.VElement) {
            const enterAttr = findAttribute(node, "enter-class")
            const enterFromAttr = findAttribute(node, "enter-from-class")
            if (enterAttr && !enterFromAttr) {
                report(enterAttr.key, "deprecatedProps", "enter")
            }
            const leaveAttr = findAttribute(node, "leave-class")
            const leaveFromAttr = findAttribute(node, "leave-from-class")
            if (leaveAttr && !leaveFromAttr) {
                report(leaveAttr.key, "deprecatedProps", "leave")
            }
            return {
                hasEnterClass: enterAttr || enterFromAttr,
                hasLeaveClass: leaveAttr || leaveFromAttr,
            }
        }

        return {
            "Program:exit"() {
                for (const transition of getElements(
                    context,
                    (element) =>
                        isTransitionElement(element) ||
                        isTransitionGroupElement(element),
                )) {
                    const {
                        hasEnterClass,
                        hasLeaveClass,
                    } = verifyTransitionElementNode(transition)
                    if (hasEnterClass && hasLeaveClass) {
                        continue
                    }
                    const nodes = getAttributeValueNodes(
                        transition,
                        "name",
                        context,
                    )
                    if (!nodes) {
                        // unknown
                        return
                    }
                    if (!nodes.length) {
                        if (!hasEnterClass) {
                            addDeprecatedClassName(
                                Template.of("v-enter"),
                                "enter",
                            )
                            addRenamedClassName(Template.of("v-enter-from"))
                        }
                        if (!hasLeaveClass) {
                            addDeprecatedClassName(
                                Template.of("v-leave"),
                                "leave",
                            )
                            addRenamedClassName(Template.of("v-leave-from"))
                        }
                    } else {
                        for (const name of nodes) {
                            const value = Template.ofNode(name)
                            if (value == null) {
                                // Are identified by complex expressions.
                                return
                            }
                            if (!hasEnterClass) {
                                addDeprecatedClassName(
                                    value.concat("-enter"),
                                    "enter",
                                )
                                addRenamedClassName(value.concat("-enter-from"))
                            }
                            if (!hasLeaveClass) {
                                addDeprecatedClassName(
                                    value.concat("-leave"),
                                    "leave",
                                )
                                addRenamedClassName(value.concat("-leave-from"))
                            }
                        }
                    }
                }

                for (const style of styles) {
                    for (const node of style.cssNode.nodes) {
                        verifyCSSNode(node)
                    }
                }
            },
        }
    },
}
