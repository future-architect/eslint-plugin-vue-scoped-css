import {
    isNestingAtRule,
    findNestingSelectors,
    isSelectorCombinator,
} from "../../utils/selectors"
import { VCSSSelectorCombinator, VCSSSelectorNode, VCSSNode } from "../../ast"
import { CSSSelectorResolver, ResolvedSelector } from "./css-selector-resolver"
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
        selectorNodes: VCSSSelectorNode[],
        parentSelectors: ResolvedSelector[],
        container: VCSSNode,
    ): ResolvedSelector[] {
        if (isNestingAtRule(container)) {
            return this.resolveSelectorForNestContaining(
                selectorNodes,
                parentSelectors,
                container,
            )
        }
        return this.resolveSelectorForSCSSNesting(
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
        selectorNodes: VCSSSelectorNode[],
        parentSelectors: ResolvedSelector[],
        container: VCSSNode,
    ) {
        const nestings = findNestingSelectors(selectorNodes)
        if (!nestings.next().done) {
            let resolvedSelectors = this.resolveSelectorForNestContaining(
                selectorNodes,
                parentSelectors,
                container,
            )
            while (!nestings.next().done) {
                // e.g.  & + &
                resolvedSelectors = resolvedSelectors
                    .map(resolvedSelector =>
                        this.resolveSelectorForNestContaining(
                            resolvedSelector.selector,
                            parentSelectors,
                            container,
                        ),
                    )
                    .reduce((r, rs) => [...r, ...rs], [])
            }
            return resolvedSelectors
        }

        // SCSS css nesting
        const first = selectorNodes[0]
        if (isSelectorCombinator(first)) {
            return parentSelectors.map(
                parentSelector =>
                    new ResolvedSelector(
                        [...parentSelector.selector, ...selectorNodes],
                        container,
                    ),
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

        return parentSelectors.map(
            parentSelector =>
                new ResolvedSelector(
                    [...parentSelector.selector, comb, ...selectorNodes],
                    container,
                ),
        )
    }
}

export { ResolvedSelector }
