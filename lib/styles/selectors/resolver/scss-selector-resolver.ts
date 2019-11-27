import {
    isNestingAtRule,
    findNestingSelectors,
    isSelectorCombinator,
    findNestingSelector,
    NestingInfo,
} from "../../utils/selectors"
import {
    VCSSSelectorCombinator,
    VCSSSelectorValueNode,
    VCSSStyleRule,
    VCSSAtRule,
    VCSS,
} from "../../ast"
import {
    CSSSelectorResolver,
    ResolvedSelector,
    ResolvedSelectors,
} from "./css-selector-resolver"
import { PostCSSSPCombinatorNode } from "../../../types"

export class SCSSSelectorResolver extends CSSSelectorResolver {
    /**
     * Resolve nesting selector
     * @param {Node[]} selectorNodes the selector
     * @param {ResolvedSelector[]} parentSelectors parent selectors
     * @param {Node} container the container node
     * @returns {ResolvedSelector[]} resolved selectors
     */
    protected resolveNestingSelectors(
        owner: ResolvedSelectors,
        selectorNodes: VCSSSelectorValueNode[],
        parentSelectors: ResolvedSelectors,
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
        return this.resolveSelectorForSCSSNesting(
            owner,
            selectorNodes,
            parentSelectors,
            container,
        )
    }

    /**
     * Resolve nesting selector for lang SCSS
     * @param {Node[]} selectorNodes the selector
     * @param {ResolvedSelector[]} parentSelectors parent selectors
     * @param {Node} container the container node
     * @returns {ResolvedSelector[]} resolved selectors
     */
    private resolveSelectorForSCSSNesting(
        owner: ResolvedSelectors,
        selectorNodes: VCSSSelectorValueNode[],
        parentSelectors: ResolvedSelectors,
        container: VCSSAtRule | VCSSStyleRule,
    ): ResolvedSelector[] {
        const nesting = findNestingSelector(selectorNodes)
        if (nesting != null) {
            let resolvedSelectors = this.resolveSelectorForNestContaining(
                owner,
                selectorNodes,
                nesting,
                parentSelectors,
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
                        nextResolvedSelectors.push(
                            ...this.resolveSelectorForNestContaining(
                                owner,
                                resolvedSelector.selector,
                                nextNesting,
                                parentSelectors,
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

        // SCSS css nesting
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
