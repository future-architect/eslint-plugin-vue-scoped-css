import {
    getStyleContexts,
    getCommentDirectivesReporter,
    StyleContext,
} from "../styles"

import { getResolvedSelectors, ResolvedSelector } from "../styles/selectors"

import { VCSSSelectorNode, VCSSSelectorCombinator } from "../styles/ast"
import {
    isTypeSelector,
    isIDSelector,
    isClassSelector,
    isUniversalSelector,
    isSelectorCombinator,
    isChildCombinator,
    isAdjacentSiblingCombinator,
    isGeneralSiblingCombinator,
    isDeepCombinator,
} from "../styles/utils/selectors"

import { createQueryContext, QueryContext } from "../styles/selectors/query"
import { isRootElement } from "../styles/selectors/query/elements"
import { RuleContext } from "../types"

/**
 * Gets scoped selectors.
 * @param {StyleContext} style The style context
 * @returns {VCSSSelectorNode[][]} selectors
 */
function getScopedSelectors(style: StyleContext): VCSSSelectorNode[][] {
    const resolvedSelectors = getResolvedSelectors(style)
    return resolvedSelectors.map(getScopedSelector)
}

/**
 * Gets scoped selector.
 * @param {ResolvedSelector} resolvedSelector CSS selector
 * @returns {VCSSSelectorNode[]} scoped selector
 */
function getScopedSelector(
    resolvedSelector: ResolvedSelector,
): VCSSSelectorNode[] {
    const { selector } = resolvedSelector
    const deepIndex = selector.findIndex(isDeepCombinator)
    const scopedCandidateSelector =
        deepIndex >= 0 ? selector.slice(0, deepIndex) : [...selector]

    const results = []
    for (const sel of scopedCandidateSelector.reverse()) {
        if (isSelectorCombinator(sel)) {
            if (
                !isChildCombinator(sel) &&
                !isAdjacentSiblingCombinator(sel) &&
                !isGeneralSiblingCombinator(sel)
            ) {
                break
            }
        }

        results.push(sel)
    }
    return results.reverse()
}

module.exports = {
    meta: {
        docs: {
            description:
                "Reports selectors defined in Scoped CSS not used in `<template>`.",
            category: "recommended",
            default: "warn",
            url:
                "https://github.com/future-architect/eslint-plugin-vue-scoped-css/blob/v0.0.0/docs/rules/no-unused-selector.ts.md",
        },
        fixable: null,
        messages: {
            unused: "The selector `{{selector}}` is unused.",
        },
        schema: [
            {
                type: "object",
                properties: {
                    ignoreBEMModifier: {
                        type: "boolean",
                    },
                },
                additionalProperties: false,
            },
        ],
        type: "suggestion", // "problem",
    },
    create(context: RuleContext) {
        const styles = getStyleContexts(context).filter(
            style => !style.invalid && style.scoped,
        )
        if (!styles.length) {
            return {}
        }
        const reporter = getCommentDirectivesReporter(context)

        const reportedSet = new Set<VCSSSelectorNode>()

        /**
         * Reports the given nodes.
         * @param {ASTNode} nodes nodes to report
         */
        function report(nodes: VCSSSelectorNode[]) {
            if (!reportedSet.has(nodes[0])) {
                reporter.report({
                    loc: {
                        start: nodes[0].loc.start,
                        end: nodes[nodes.length - 1].loc.end,
                    },
                    messageId: "unused",
                    data: {
                        selector: nodes.map(n => n.selector).join(""),
                    },
                })
                reportedSet.add(nodes[0])
            }
        }

        /**
         * Verify the selector
         */
        function verifySelector(
            queryContext: QueryContext,
            scopedSelector: VCSSSelectorNode[],
        ) {
            const reportSelectorNodes: VCSSSelectorNode[] = []
            let targetsQueryContext = queryContext
            let reverseVerifySelector = [...scopedSelector].reverse()
            while (reverseVerifySelector.length) {
                const combIndex = reverseVerifySelector.findIndex(
                    isSelectorCombinator,
                )
                let comb: VCSSSelectorCombinator | null = null
                let selectorBlock: VCSSSelectorNode[] = []

                if (combIndex >= 0) {
                    // `> .a.b` -> comb=">" , selectorBlock=[".a", ".b"]
                    comb = reverseVerifySelector[
                        combIndex
                    ] as VCSSSelectorCombinator
                    selectorBlock = reverseVerifySelector.slice(0, combIndex)

                    // Setup the selectors to verify at the next.
                    reverseVerifySelector = reverseVerifySelector.slice(
                        combIndex + 1,
                    )
                } else {
                    // `.a.b` -> comb=null , selectorBlock=[".a", ".b"]
                    selectorBlock = reverseVerifySelector

                    // There is no selectors to verify at the next.
                    reverseVerifySelector = []
                }

                const classSelectors = selectorBlock.filter(isClassSelector)
                const notClassSelectors = selectorBlock.filter(
                    s =>
                        // Filter verify target slector
                        // Other selectors are ignored because they are likely to be changed dynamically.
                        isSelectorCombinator(s) ||
                        isTypeSelector(s) ||
                        isIDSelector(s) ||
                        isUniversalSelector(s),
                )

                for (const selectorNode of notClassSelectors) {
                    targetsQueryContext = targetsQueryContext.reverseQueryStep(
                        selectorNode,
                    )
                }

                const roots = targetsQueryContext.filter(isRootElement)
                if (roots.elements.length) {
                    // The root element can add classes by defining a parent.
                    // The root element is considered to match if it matches at least one Class Selector.
                    for (const selectorNode of classSelectors) {
                        if (
                            roots.reverseQueryStep(selectorNode).elements.length
                        ) {
                            return
                        }
                    }
                }
                for (const selectorNode of classSelectors) {
                    targetsQueryContext = targetsQueryContext.reverseQueryStep(
                        selectorNode,
                    )
                }
                reportSelectorNodes.push(...selectorBlock)
                if (comb) {
                    if (!targetsQueryContext.elements.length) {
                        // to report
                        break
                    }
                    if (targetsQueryContext.elements.some(isRootElement)) {
                        return
                    }
                    targetsQueryContext = targetsQueryContext.reverseQueryStep(
                        comb,
                    )
                    reportSelectorNodes.push(comb)
                }
            }
            if (!targetsQueryContext.elements.length) {
                report(reportSelectorNodes.reverse())
            }
        }

        return {
            "Program:exit"() {
                const queryContext = createQueryContext(
                    context,
                    context.options[0] || {},
                )

                for (const style of styles) {
                    for (const scopedSelector of getScopedSelectors(style)) {
                        verifySelector(queryContext, scopedSelector)
                    }
                }
            },
        }
    },
}
