import {
    isNestingSelector,
    isNestingAtRule,
    isTypeSelector,
    findNestingSelectors,
    hasNodesSelector,
} from "../../utils/selectors"
import {
    VCSSStyleSheet,
    VCSSNode,
    VCSSSelectorNode,
    VCSSTypeSelector,
    VCSSNestingSelector,
    VCSSSelectorValueNode,
    VCSSSelectorContainerNode,
} from "../../ast"
import {
    isVCSSStyleRule,
    isVCSSAtRule,
    isVCSSContainerNode,
} from "../../utils/css-nodes"

export class ResolvedSelector {
    public readonly selector: VCSSSelectorNode[]
    public readonly container: VCSSNode
    /**
     * constructor
     * @param {Node[]} selector the selector
     * @param {Node} container the container node
     */
    public constructor(selector: VCSSSelectorNode[], container: VCSSNode) {
        this.selector = selector
        this.container = container
    }
}

export class CSSSelectorResolver {
    /**
     * Get the selector that resolved the nesting.
     * @param {VCSSStyleSheet} rootStyle The style node
     * @returns {ResolvedSelector[]} the selector that resolved the nesting.
     */
    public resolveSelectors(rootStyle: VCSSStyleSheet) {
        return this.resolveNodesSelectors(rootStyle.nodes, null)
    }

    /**
     * Get the selector that resolved the nesting.
     * @param {Node[]} nodes the nodes
     * @param {ResolvedSelector[]|null} parentSelectors
     * @returns {ResolvedSelector[]} resolved selectors
     */
    private resolveNodesSelectors(
        nodes: VCSSNode[],
        parentSelectors: ResolvedSelector[] | null,
    ): ResolvedSelector[] {
        const results: ResolvedSelector[] = []
        for (const node of nodes) {
            const selectorNodes = this.getSelectorNodes(node)
            let selectors = null
            if (selectorNodes) {
                selectors = []
                if (!parentSelectors) {
                    for (const selectorNode of selectorNodes.filter(
                        hasNodesSelector,
                    )) {
                        const rootResolvedSelector = this.createRootResolvedSelector(
                            selectorNode.nodes,
                            node,
                        )
                        results.push(rootResolvedSelector)
                        selectors.push(rootResolvedSelector)
                    }
                } else {
                    for (const selectorNode of selectorNodes.filter(
                        hasNodesSelector,
                    )) {
                        const resolvedSelectors = this.resolveNestingSelectors(
                            selectorNode.nodes,
                            parentSelectors,
                            node,
                        )
                        for (const resolvedSelector of resolvedSelectors) {
                            results.push(resolvedSelector)
                            selectors.push(resolvedSelector)
                        }
                    }
                }
            } else if (this.isIgnoreNode(node)) {
                continue
            } else {
                selectors = parentSelectors
            }

            if (isVCSSContainerNode(node)) {
                results.push(
                    ...this.resolveNodesSelectors(node.nodes, selectors),
                )
            }
        }
        return results
    }

    /* eslint-disable class-methods-use-this */

    /**
     * Get selectors of given node.
     * @param {Node} node the node
     * @returns {VCSSSelector[]|null} selectors
     */
    private getSelectorNodes(node: VCSSNode): VCSSSelectorNode[] | null {
        if (isVCSSStyleRule(node) || isNestingAtRule(node)) {
            return node.selectors
        }
        return null
    }

    private isIgnoreNode(node: VCSSNode) {
        return isVCSSAtRule(node) && node.name === "keyframes"
    }

    /**
     * Create root ResolvedSelector
     * @param {Node[]} selectorNodes the selector
     * @param {Node} container the container node
     * @returns {ResolvedSelector} ResolvedSelector
     */
    private createRootResolvedSelector(
        selectorNodes: VCSSSelectorNode[],
        container: VCSSNode,
    ) {
        return new ResolvedSelector(selectorNodes, container)
    }

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
        const nestingIndex = selectorNodes.findIndex(isNestingSelector)

        if (nestingIndex === 0) {
            return this.resolveSelectorForNestPrefixed(
                selectorNodes,
                parentSelectors,
                container,
            )
        }
        return [new ResolvedSelector(selectorNodes, container)]
    }

    /**
     * Resolve selectors that a nesting selector on the first.
     * @param {Node[]} selectorNodes the selector
     * @param {ResolvedSelector[]} parentSelectors parent selectors
     * @param {Node} container the container node
     * @returns {ResolvedSelector[]} resolved selectors
     */
    private resolveSelectorForNestPrefixed(
        selectorNodes: VCSSSelectorNode[],
        parentSelectors: ResolvedSelector[],
        container: VCSSNode,
    ) {
        if (!selectorNodes.length || !isNestingSelector(selectorNodes[0])) {
            // To be nest-prefixed, a nesting selector must be the first simple selector in the first compound selector of the selector.
            return [new ResolvedSelector(selectorNodes, container)]
        }
        const after = selectorNodes.slice(1)

        return parentSelectors.map(
            parentSelector =>
                new ResolvedSelector(
                    [...parentSelector.selector, ...after],
                    container,
                ),
        )
    }

    /**
     * Resolve selectors that contain a nesting selector.
     * @param {Node[]} selectorNodes the selector
     * @param {ResolvedSelector[]} parentSelectors parent selectors
     * @param {Node} container the container node
     * @returns {ResolvedSelector[]} resolved selectors
     */
    protected resolveSelectorForNestContaining(
        selectorNodes: VCSSSelectorNode[],
        parentSelectors: ResolvedSelector[],
        container: VCSSNode,
    ) {
        const nesting = findNestingSelectors(selectorNodes).next().value
        if (!nesting) {
            // Must be nest-containing, which means it contains a nesting selector in it somewhere.
            return [new ResolvedSelector(selectorNodes, container)]
        }
        const {
            nestingIndex,
            nodes: hasNestingNodes,
            node: nestingNode,
        } = nesting

        const nestingLeftNode = hasNestingNodes[nestingIndex - 1]
        const nestingRightNode = hasNestingNodes[(nestingIndex as number) + 1]
        const maybeJoinLeft =
            nestingLeftNode && nestingLeftNode.range[1] === nestingNode.range[0]
        const needJoinRight =
            nestingRightNode &&
            nestingNode.range[1] === nestingRightNode.range[0] &&
            isTypeSelector(nestingRightNode)

        const beforeSelector = hasNestingNodes.slice(0, nestingIndex)
        const afterSelector = hasNestingNodes.slice(
            (nestingIndex as number) + 1,
        )

        let resolved = parentSelectors.map(p => {
            const before = [...beforeSelector]
            const after = [...afterSelector]
            const parentSelector = [...p.selector]
            const needJoinLeft =
                maybeJoinLeft && isTypeSelector(parentSelector[0])
            if (needJoinLeft && needJoinRight && parentSelector.length === 1) {
                // concat both (e.g. `bar { @nest foo-&-baz {} }` -> .foo-bar-baz)
                before.push(
                    newNestingConcatBothSelectorNodes(
                        before.pop() as VCSSTypeSelector,
                        parentSelector.shift() as VCSSSelectorNode,
                        after.shift() as VCSSSelectorNode,
                        nestingNode,
                    ),
                )
            } else {
                if (needJoinLeft) {
                    // concat left (e.g. `bar { @nest .foo-& {} }` -> .foo-bar)
                    before.push(
                        newNestingConcatLeftSelectorNodes(
                            before.pop() as VCSSTypeSelector,
                            parentSelector.shift() as VCSSSelectorNode,
                            nestingNode,
                        ),
                    )
                }
                if (needJoinRight) {
                    // concat right (e.g. `.foo { @nest &-bar {} }` -> .foo-bar)
                    after.unshift(
                        newNestingConcatRightSelectorNodes(
                            parentSelector.pop() as VCSSSelectorValueNode,
                            after.shift() as VCSSSelectorValueNode,
                            nestingNode,
                        ),
                    )
                }
            }
            return new ResolvedSelector(
                [...before, ...parentSelector, ...after],
                container,
            )
        })

        let nestingTargetNode: VCSSSelectorNode = nestingNode
        while (!selectorNodes.includes(nestingTargetNode)) {
            const parent = nestingTargetNode.parent as VCSSSelectorContainerNode
            const index: number = parent.parent.nodes.indexOf(parent as any)
            const before = parent.parent.nodes.slice(
                0,
                index,
            ) as VCSSSelectorNode[]
            const after = parent.parent.nodes.slice(
                index + 1,
            ) as VCSSSelectorNode[]
            resolved = resolved.map(selector => {
                const newNode = parent.copy()
                newNode.nodes = selector.selector
                return new ResolvedSelector(
                    [...before, newNode, ...after],
                    container,
                )
            })
            nestingTargetNode = parent
        }
        return resolved
    }

    /* eslint-enable class-methods-use-this */
}

/**
 * Creates a selector node that concats the left and right selectors of the parent selector and the nested selector.
 */
function newNestingConcatBothSelectorNodes(
    left: VCSSTypeSelector,
    parent: VCSSSelectorNode,
    right: VCSSSelectorNode,
    _nesting: any,
) {
    const loc = {
        start: left.loc.start,
        end: right.loc.end,
    }
    const newNode = left.copy({
        loc,
        start: left.range[0],
        end: right.range[1],
        parent: left.parent,
        value: `${left.value}${parent.selector}${right.selector}`,
    })

    return newNode
}

/**
 * Creates a selector node that concats the left selectors of the parent selector and the nested selector.
 */
function newNestingConcatLeftSelectorNodes(
    left: VCSSTypeSelector,
    parent: VCSSSelectorNode,
    nesting: VCSSNestingSelector,
) {
    const loc = {
        start: left.loc.start,
        end: nesting.loc.end,
    }
    const newNode = left.copy({
        loc,
        start: left.range[0],
        end: nesting.range[1],
        parent: left.parent,
        value: `${left.value}${parent.selector}`,
    })
    return newNode
}

/**
 * Creates a selector node that concats the right selectors of the parent selector and the nested selector.
 */
function newNestingConcatRightSelectorNodes(
    parent: VCSSSelectorValueNode,
    right: VCSSSelectorValueNode,
    nesting: VCSSNestingSelector,
) {
    const loc = {
        start: nesting.loc.start,
        end: right.loc.end,
    }
    const newNode = parent.copy({
        node: right.node,
        loc,
        start: nesting.range[0],
        end: right.range[1],
        parent: right.parent,
        value: `${parent.value}${right.selector}`,
    })
    return newNode
}
