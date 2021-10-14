import type { ResolvedSelector } from "../styles/selectors"
import { getResolvedSelectors } from "../styles/selectors"
import {
    isTypeSelector,
    isIDSelector,
    isClassSelector,
    isUniversalSelector,
    isSelectorCombinator,
    isDeepCombinator,
    isVDeepPseudo,
    isVueSpecialPseudo,
    isDescendantCombinator,
    isVSlottedPseudo,
    isVGlobalPseudo,
} from "../styles/utils/selectors"
import type { QueryContext } from "../styles/selectors/query"
import { createQueryContext } from "../styles/selectors/query"
import type { VCSSSelectorNode } from "../styles/ast"
import type { RuleContext, Rule } from "../types"
import type { ValidStyleContext } from "../styles/context"
import {
    getStyleContexts,
    getCommentDirectivesReporter,
} from "../styles/context"
import { hasTemplateBlock, isDefined } from "../utils/utils"
import { parseQueryOptions } from "../options"
import { isValidStyleContext } from "../styles/context/style"

declare const module: {
    exports: Rule
}

/**
 * Gets scoped selectors.
 * @param {StyleContext} style The style context
 * @returns {VCSSSelectorNode[][]} selectors
 */
function getScopedSelectors(style: ValidStyleContext): VCSSSelectorNode[][] {
    const resolvedSelectors = getResolvedSelectors(style)
    return resolvedSelectors.map(getScopedSelector).filter(isDefined)
}

/**
 * Gets scoped selector.
 * @param {ResolvedSelector} resolvedSelector CSS selector
 * @returns {VCSSSelectorNode[]} scoped selector
 */
function getScopedSelector(
    resolvedSelector: ResolvedSelector,
): VCSSSelectorNode[] | null {
    const { selector } = resolvedSelector
    const specialNodeIndex = selector.findIndex(
        (s) => isDeepCombinator(s) || isVueSpecialPseudo(s),
    )
    if (specialNodeIndex >= 0) {
        const specialNode = selector[specialNodeIndex]
        if (isDeepCombinator(specialNode) || isVDeepPseudo(specialNode)) {
            const scopedCandidateSelector = selector.slice(0, specialNodeIndex)

            const last = scopedCandidateSelector.pop()
            if (last && !isDescendantCombinator(last)) {
                scopedCandidateSelector.push(last)
            }
            return scopedCandidateSelector
        } else if (isVSlottedPseudo(specialNode)) {
            return selector.slice(0, specialNodeIndex + 1)
        } else if (isVGlobalPseudo(specialNode)) {
            return null
        }
        return [...selector]
    }
    return [...selector]
}

module.exports = {
    meta: {
        docs: {
            description:
                "disallow selectors defined that is not used inside `<template>`",
            categories: [],
            default: "warn",
            url: "https://future-architect.github.io/eslint-plugin-vue-scoped-css/rules/require-selector-used-inside.html",
        },
        fixable: null,
        messages: {
            unused: "The selector `{{selector}}` is unused in the template.",
        },
        schema: [
            {
                type: "object",
                properties: {
                    ignoreBEMModifier: {
                        type: "boolean",
                    },
                    captureClassesFromDoc: {
                        type: "array",
                        items: [
                            {
                                type: "string",
                            },
                        ],
                        minItems: 0,
                        uniqueItems: true,
                    },
                },
                additionalProperties: false,
            },
        ],
        type: "suggestion",
    },
    create(context: RuleContext) {
        if (!hasTemplateBlock(context)) {
            return {}
        }
        const styles = getStyleContexts(context)
            .filter(isValidStyleContext)
            .filter((style) => style.scoped)
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
            const last = nodes[nodes.length - 1]
            if (!reportedSet.has(last)) {
                reporter.report({
                    loc: {
                        start: nodes[0].loc.start,
                        end: last.loc.end,
                    },
                    messageId: "unused",
                    data: {
                        selector: nodes.map((n) => n.selector).join(""),
                    },
                })
                reportedSet.add(last)
            }
        }

        /**
         * Verify the selector
         */
        function verifySelector(
            queryContext: QueryContext,
            scopedSelector: VCSSSelectorNode[],
        ) {
            let targetsQueryContext = queryContext
            const selectorNodes = scopedSelector
                // Filter verify target selector
                // Other selectors are ignored because they are likely to be changed dynamically.
                .filter(
                    (s) =>
                        isSelectorCombinator(s) ||
                        isTypeSelector(s) ||
                        isIDSelector(s) ||
                        isClassSelector(s) ||
                        isUniversalSelector(s) ||
                        isVueSpecialPseudo(s),
                )

            for (let index = 0; index < selectorNodes.length; index++) {
                const selectorNode = selectorNodes[index]

                targetsQueryContext =
                    targetsQueryContext.queryStep(selectorNode)
                if (!targetsQueryContext.elements.length) {
                    report(selectorNodes.slice(0, index + 1))
                    break
                }
            }
        }

        return {
            "Program:exit"() {
                const queryContext = createQueryContext(
                    context,
                    parseQueryOptions(context.options[0]),
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
