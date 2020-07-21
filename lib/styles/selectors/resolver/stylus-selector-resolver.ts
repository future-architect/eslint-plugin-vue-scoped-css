import {
    isNestingAtRule,
    findNestingSelectors,
    findNestingSelector,
    hasNodesSelector,
    NestingInfo,
    isSelectorCombinator,
} from "../../utils/selectors"
import {
    VCSSSelectorCombinator,
    VCSSStyleRule,
    VCSSAtRule,
    VCSS,
    VCSSSelectorNode,
} from "../../ast"
import {
    CSSSelectorResolver,
    ResolvedSelector,
    ResolvedSelectors,
} from "./css-selector-resolver"
import type { PostCSSSPCombinatorNode } from "../../../types"

export class StylusSelectorResolver extends CSSSelectorResolver {
    /**
     * Resolve nesting selector
     * @param {Node[]} selectorNodes the selector
     * @param {ResolvedSelector[]} parentSelectors parent selectors
     * @param {Node} container the container node
     * @returns {ResolvedSelector[]} resolved selectors
     */
    protected resolveNestingSelectors(
        owner: ResolvedSelectors,
        selectorNodes: VCSSSelectorNode[],
        parentSelectors: ResolvedSelectors | null,
        container: VCSSAtRule | VCSSStyleRule,
    ): ResolvedSelector[] {
        if (isNestingAtRule(container)) {
            return this.resolveSelectorForNestContaining(
                owner,
                selectorNodes,
                findNestingSelector(selectorNodes),
                parentSelectors,
                container,
            )
        }
        return this.resolveSelectorForStylusNesting(
            owner,
            selectorNodes,
            parentSelectors,
            container,
        )
    }

    /**
     * Resolve nesting selector for lang Stylus
     * @param {Node[]} selectorNodes the selector
     * @param {ResolvedSelector[]} parentSelectors parent selectors
     * @param {Node} container the container node
     * @returns {ResolvedSelector[]} resolved selectors
     */
    private resolveSelectorForStylusNesting(
        owner: ResolvedSelectors,
        selectorNodes: VCSSSelectorNode[],
        parentSelectors: ResolvedSelectors | null,
        container: VCSSAtRule | VCSSStyleRule,
    ): ResolvedSelector[] {
        const nesting = findNestingSelector(selectorNodes)
        if (nesting != null) {
            const nestingParent = parentSelectors
                ? this.getNestingParentSelectors(parentSelectors, nesting)
                : null
            let resolvedSelectors = this.resolveSelectorForNestContaining(
                owner,
                selectorNodes,
                nesting,
                nestingParent,
                container,
            )

            let hasNesting = true
            while (hasNesting) {
                hasNesting = false
                const nextResolvedSelectors = []
                for (const resolvedSelector of resolvedSelectors) {
                    const nextNesting = findNextNestingSelector(
                        resolvedSelector,
                        container,
                    )
                    if (nextNesting) {
                        hasNesting = true
                        const nextNestingParent = parentSelectors
                            ? this.getNestingParentSelectors(
                                  parentSelectors,
                                  nextNesting,
                              )
                            : null
                        nextResolvedSelectors.push(
                            ...this.resolveSelectorForNestContaining(
                                owner,
                                resolvedSelector.selector,
                                nextNesting,
                                nextNestingParent,
                                container,
                            ),
                        )
                    }
                }
                if (!hasNesting) {
                    break
                }
                resolvedSelectors = nextResolvedSelectors
            }
            return resolvedSelectors
        }

        const first = selectorNodes[0]
        if (isSelectorCombinator(first)) {
            return this.resolveSelectorForNestConcat(
                owner,
                selectorNodes,
                parentSelectors,
                container,
            )
        }

        // create descendant combinator
        const comb = new VCSSSelectorCombinator(
            first.node as PostCSSSPCombinatorNode,
            {
                start: first.loc.start,
                end: first.loc.start,
            },
            first.range[0],
            first.range[0],
            first.parent as any,
        )
        comb.value = " "
        comb.selector = " "

        return this.resolveSelectorForNestConcat(
            owner,
            [comb, ...selectorNodes],
            parentSelectors,
            container,
        )
    }

    /**
     * Gets the ResolvedSelectors that correspond to the given nesting selector.
     */
    private getNestingParentSelectors(
        parentSelectors: ResolvedSelectors,
        nesting: NestingInfo,
    ): ResolvedSelectors | null {
        if (nesting.node.value === "&") {
            // The nestingNode is parent reference. e.g `&`
            return parentSelectors
        }

        const partialRef = /^\^\[([\s\S]+?)\]$/u.exec(nesting.node.value)
        if (partialRef) {
            // The nestingNode is a partial reference. e.g. `^[0]`, `^[1]`, `^[-1]`, `^[1..-1]`
            const partialRefValue = partialRef[1]
            const arrayParentSelectors = toArray(parentSelectors)
            const parsed = parsePartialRefValue(
                partialRefValue,
                arrayParentSelectors.length,
            )

            if (!parsed) {
                return null
            }
            if (parsed.start === 0) {
                // e.g. `^[0]`, `^[1]`, `^[-1]`
                return arrayParentSelectors[parsed.end]
            }
            // e.g. `^[1..-1]`
            return this.buildRangeResolveNestingSelectors(
                arrayParentSelectors.slice(parsed.start, parsed.end + 1),
            )
        }

        if (nesting.node.value === "~/" && nesting.nestingIndex === 0) {
            // The nestingNode is initial reference. `~/`
            const arrayParentSelectors = toArray(parentSelectors)
            return arrayParentSelectors[0]
        }

        if (
            /^(?:\.\.\/)+$/gu.test(nesting.node.value) &&
            nesting.nestingIndex === 0
        ) {
            // The nestingNode is relative reference. e.g. `../`
            const arrayParentSelectors = toArray(parentSelectors)
            const index =
                arrayParentSelectors.length - nesting.node.value.length / 3 - 1
            return arrayParentSelectors.length > index && index >= 0
                ? arrayParentSelectors[index]
                : null
        }

        if (nesting.node.value === "/" && nesting.nestingIndex === 0) {
            // The nestingNode is root reference. `/`
            return null
        }

        // unknown
        return parentSelectors
    }

    private buildRangeResolveNestingSelectors(
        range: ResolvedSelectors[],
    ): ResolvedSelectors {
        const stack = [...range]

        let resolvedSelectors: ResolvedSelectors | null = null
        let next = stack.shift()
        while (next != null) {
            const targetResolvedSelectors: ResolvedSelectors = new ResolvedSelectors(
                next.container,
                resolvedSelectors,
            )
            for (const selector of next.container.selectors.filter(
                hasNodesSelector,
            )) {
                const selectors = this.resolveNestingSelectors(
                    targetResolvedSelectors,
                    selector.nodes,
                    resolvedSelectors,
                    next.container,
                )
                targetResolvedSelectors.selectors.push(...selectors)
            }
            resolvedSelectors = targetResolvedSelectors
            next = stack.shift()
        }

        return resolvedSelectors as ResolvedSelectors
    }
}

export { ResolvedSelector }

/**
 * Find next nesting selector
 */
export function findNextNestingSelector(
    resolved: ResolvedSelector,
    container: VCSSAtRule | VCSSStyleRule,
): NestingInfo | null {
    for (const nest of findNestingSelectors(resolved.selector)) {
        let parent: VCSS = nest.node.parent
        while (
            parent &&
            parent.type !== "VCSSAtRule" &&
            parent.type !== "VCSSStyleRule"
        ) {
            parent = parent.parent
        }
        if (parent === container) {
            return nest
        }
    }
    return null
}

/**
 * Parse partial reference values
 */
function parsePartialRefValue(partialRefValue: string, length: number) {
    /**
     * num to index
     */
    function numberToIndex(n: number, minusOffset = 0) {
        if (n >= 0) {
            return n
        }
        return length + n + minusOffset
    }

    const num = Number(partialRefValue)
    if (Number.isInteger(num)) {
        // e.g. `^[0]`, `^[1]`, `^[-1]`
        const index = numberToIndex(num, -1)
        if (index < 0 || length <= index) {
            // out of range
            return null
        }
        return {
            start: 0,
            end: index,
        }
    }

    const rangeValues = /^([-+]?\d+)\.\.([-+]?\d+)$/u.exec(partialRefValue)

    if (rangeValues) {
        // The nestingNode is ranges in partial references.
        const start = numberToIndex(Number(rangeValues[1]))
        const end = numberToIndex(Number(rangeValues[2]))

        if (
            start < 0 ||
            length <= start ||
            end < 0 ||
            length <= end ||
            end < start
        ) {
            // out of range
            return null
        }
        return {
            start,
            end,
        }
    }
    // unknown
    return null
}

/**
 * ResolvedSelectors to array ResolvedSelectors
 */
function toArray(selectors: ResolvedSelectors): ResolvedSelectors[] {
    const array = [selectors]
    let parent = selectors.parent
    while (parent != null) {
        array.unshift(parent)
        parent = parent.parent
    }
    return array
}
