import { getResolvedSelectors, ResolvedSelector } from "../styles/selectors"
import {
    isTypeSelector,
    isIDSelector,
    isClassSelector,
    isUniversalSelector,
    isSelectorCombinator,
    isDeepCombinator,
} from "../styles/utils/selectors"
import { createQueryContext, QueryContext } from "../styles/selectors/query"
import { VCSSSelectorNode } from "../styles/ast"
import { RuleContext } from "../types"
import { ParsedQueryOptions } from "../options"
import {
    ValidStyleContext,
    getStyleContexts,
    StyleContext,
    getCommentDirectivesReporter,
} from "../styles/context"

/**
 * Gets scoped selectors.
 * @param {StyleContext} style The style context
 * @returns {VCSSSelectorNode[][]} selectors
 */
function getScopedSelectors(style: ValidStyleContext): VCSSSelectorNode[][] {
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
    return deepIndex >= 0 ? selector.slice(0, deepIndex) : [...selector]
}

module.exports = {
    meta: {
        docs: {
            description:
                "Reports the defined selectors is not used inside `<template>`.",
            category: undefined,
            default: "warn",
            url:
                "https://future-architect.github.io/eslint-plugin-vue-scoped-css/rules/require-selector-used-inside.html",
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
        const styles = getStyleContexts(context)
            .filter(StyleContext.isValid)
            .filter(style => style.scoped)
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
                        selector: nodes.map(n => n.selector).join(""),
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
                // Filter verify target slector
                // Other selectors are ignored because they are likely to be changed dynamically.
                .filter(
                    s =>
                        isSelectorCombinator(s) ||
                        isTypeSelector(s) ||
                        isIDSelector(s) ||
                        isClassSelector(s) ||
                        isUniversalSelector(s),
                )

            for (let index = 0; index < selectorNodes.length; index++) {
                const selectorNode = selectorNodes[index]

                targetsQueryContext = targetsQueryContext.queryStep(
                    selectorNode,
                )
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
                    ParsedQueryOptions.parse(context.options[0]),
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
