import type { NestingInfo } from "../../utils/selectors"
import {
    isNestingSelector,
    isNestingAtRule,
    isTypeSelector,
    hasNodesSelector,
    isSelectorCombinator,
    findNestingSelector,
    isDescendantCombinator,
} from "../../utils/selectors"
import type {
    VCSSStyleSheet,
    VCSSNode,
    VCSSSelectorNode,
    VCSSTypeSelector,
    VCSSNestingSelector,
    VCSSSelectorValueNode,
    VCSSAtRule,
    VCSSStyleRule,
    VCSSSelector,
    VCSSSelectorPseudo,
} from "../../ast"
import {
    isVCSSAtRule,
    isVCSSContainerNode,
    hasSelectorNodes,
} from "../../utils/css-nodes"

export class ResolvedSelectors {
    public readonly container:
        | (VCSSAtRule & { selectors: VCSSSelectorNode[] })
        | VCSSStyleRule

    public readonly selectors: ResolvedSelector[] = []

    public readonly level: number

    public readonly parent: ResolvedSelectors | null

    public readonly children: ResolvedSelectors[] = []

    /**
     * constructor
     * @param {Node[]} selector the selector
     * @param {Node} container the container node
     */
    public constructor(
        container:
            | (VCSSAtRule & { selectors: VCSSSelectorNode[] })
            | VCSSStyleRule,
        parent: ResolvedSelectors | null,
    ) {
        this.container = container
        this.parent = parent
        this.level = (parent?.level ?? -1) + 1
    }
}

export class ResolvedSelector {
    public readonly owner: ResolvedSelectors

    public readonly selector: VCSSSelectorNode[]

    /**
     * constructor
     * @param {Node[]} selector the selector
     * @param {Node} container the container node
     */
    public constructor(owner: ResolvedSelectors, selector: VCSSSelectorNode[]) {
        this.owner = owner
        this.selector = selector
    }
}

export class CSSSelectorResolver {
    /**
     * Get the selector that resolved the nesting.
     * @param {VCSSStyleSheet} rootStyle The style node
     * @returns {ResolvedSelector[]} the selector that resolved the nesting.
     */
    public resolveSelectors(rootStyle: VCSSStyleSheet): ResolvedSelectors[] {
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
        parentSelector: ResolvedSelectors | null,
    ): ResolvedSelectors[] {
        const results: ResolvedSelectors[] = []
        for (const node of nodes) {
            if (this.isIgnoreNode(node)) {
                continue
            }

            if (hasSelectorNodes(node)) {
                results.push(this.resolveNodeSelectors(node, parentSelector))
            } else {
                if (isVCSSContainerNode(node)) {
                    results.push(
                        ...this.resolveNodesSelectors(
                            node.nodes,
                            parentSelector,
                        ),
                    )
                }
            }
        }
        return results
    }

    /**
     * Get the selector that resolved the nesting.
     * @param {VCSSStyleSheet} rootStyle The style node
     * @returns {ResolvedSelector[]} the selector that resolved the nesting.
     */
    private resolveNodeSelectors(
        node:
            | (VCSSAtRule & { name: "nest"; selectors: VCSSSelectorNode[] })
            | VCSSStyleRule,
        parentSelector: ResolvedSelectors | null,
    ): ResolvedSelectors {
        const selectorNodes = node.selectors.filter(hasNodesSelector)
        const resolved = new ResolvedSelectors(node, parentSelector)
        if (!parentSelector) {
            resolved.selectors.push(
                ...selectorNodes.map(
                    (selectorNode) =>
                        new ResolvedSelector(resolved, selectorNode.nodes),
                ),
            )
        } else {
            for (const selectorNode of selectorNodes.filter(hasNodesSelector)) {
                resolved.selectors.push(
                    ...this.resolveNestingSelectors(
                        resolved,
                        selectorNode.nodes,
                        parentSelector,
                        node,
                    ),
                )
            }
        }

        if (isVCSSContainerNode(node)) {
            resolved.children.push(
                ...this.resolveNodesSelectors(node.nodes, resolved),
            )
        }
        return resolved
    }

    private isIgnoreNode(node: VCSSNode) {
        return (
            isVCSSAtRule(node) &&
            node.name === "keyframes" &&
            node.identifier === "@"
        )
    }

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
        const nestingIndex = selectorNodes.findIndex(isNestingSelector)

        if (nestingIndex === 0) {
            return this.resolveSelectorForNestPrefixed(
                owner,
                selectorNodes,
                parentSelectors,
                container,
            )
        }
        return [new ResolvedSelector(owner, selectorNodes)]
    }

    /**
     * Resolve selectors that a nesting selector on the first.
     * @param {Node[]} selectorNodes the selector
     * @param {ResolvedSelector[]} parentSelectors parent selectors
     * @param {Node} container the container node
     * @returns {ResolvedSelector[]} resolved selectors
     */
    private resolveSelectorForNestPrefixed(
        owner: ResolvedSelectors,
        selectorNodes: VCSSSelectorNode[],
        parentSelectors: ResolvedSelectors | null,
        container: VCSSAtRule | VCSSStyleRule,
    ): ResolvedSelector[] {
        if (!selectorNodes.length || !isNestingSelector(selectorNodes[0])) {
            // To be nest-prefixed, a nesting selector must be the first simple selector in the first compound selector of the selector.
            return [new ResolvedSelector(owner, selectorNodes)]
        }
        const after = selectorNodes.slice(1)

        return this.resolveSelectorForNestConcat(
            owner,
            after,
            parentSelectors,
            container,
        )
    }

    /**
     * Resolves selectors that concatenate nested selectors.
     * @param {Node[]} selectorNodes the selector
     * @param {ResolvedSelector[]} parentSelectors parent selectors
     * @param {Node} container the container node
     * @returns {ResolvedSelector[]} resolved selectors
     */
    protected resolveSelectorForNestConcat(
        owner: ResolvedSelectors,
        selectorNodes: VCSSSelectorNode[],
        parentSelectors: ResolvedSelectors | null,
        _container: VCSSAtRule | VCSSStyleRule,
    ): ResolvedSelector[] {
        if (!parentSelectors) {
            const nodes = [...selectorNodes]
            if (isDescendantCombinator(nodes[0])) {
                nodes.shift()
            }
            if (isDescendantCombinator(nodes[nodes.length - 1])) {
                nodes.pop()
            }
            return [new ResolvedSelector(owner, [...nodes])]
        }

        return parentSelectors.selectors.map((parentSelector) => {
            const nodes = [...selectorNodes]
            const parent = [...parentSelector.selector]

            if (
                parent.length > 0 &&
                isSelectorCombinator(parent[parent.length - 1]) &&
                nodes.length > 0 &&
                isSelectorCombinator(nodes[0])
            ) {
                if (isDescendantCombinator(nodes[0])) {
                    nodes.shift()
                } else if (isDescendantCombinator(parent[parent.length - 1])) {
                    parent.pop()
                }
            }

            return new ResolvedSelector(owner, [...parent, ...nodes])
        })
    }

    /**
     * Resolve selectors that contain a nesting selector.
     * @param {Node[]} selectorNodes the selector
     * @param {ResolvedSelector[]} parentSelectors parent selectors
     * @param {Node} container the container node
     * @returns {ResolvedSelector[]} resolved selectors
     */
    protected resolveSelectorForNestContaining(
        owner: ResolvedSelectors,
        selectorNodes: VCSSSelectorNode[],
        nestingInfo: NestingInfo | null,
        parentSelectors: ResolvedSelectors | null,
        _container: VCSSAtRule | VCSSStyleRule,
    ): ResolvedSelector[] {
        if (!nestingInfo) {
            // Must be nest-containing, which means it contains a nesting selector in it somewhere.
            return [new ResolvedSelector(owner, selectorNodes)]
        }
        const {
            nestingIndex,
            nodes: hasNestingNodes,
            node: nestingNode,
        } = nestingInfo

        const beforeSelector = hasNestingNodes.slice(0, nestingIndex)
        const afterSelector = hasNestingNodes.slice(nestingIndex + 1)
        const nestingLeftNode =
            beforeSelector.length > 0
                ? beforeSelector[beforeSelector.length - 1]
                : null
        const nestingRightNode =
            afterSelector.length > 0 ? afterSelector[0] : null
        const maybeJoinLeft =
            nestingLeftNode &&
            nestingLeftNode.range[1] === nestingNode.range[0] &&
            !isSelectorCombinator(nestingLeftNode)
        const maybeJoinRight =
            nestingRightNode &&
            nestingNode.range[1] === nestingRightNode.range[0] &&
            isTypeSelector(nestingRightNode)

        let resolved: ResolvedSelector[]

        if (parentSelectors) {
            resolved = parentSelectors.selectors.map((p) => {
                const before = [...beforeSelector]
                const after = [...afterSelector]
                const parentSelector = [...p.selector]
                const needJoinLeft =
                    maybeJoinLeft && isTypeSelector(parentSelector[0])
                const needJoinRight =
                    maybeJoinRight &&
                    !isSelectorCombinator(
                        parentSelector[parentSelector.length - 1],
                    )
                if (
                    needJoinLeft &&
                    needJoinRight &&
                    parentSelector.length === 1
                ) {
                    // concat both (e.g. `bar { @nest .foo-&-baz {} }` -> .foo-bar-baz)
                    before.push(
                        newNestingConcatBothSelectorNodes(
                            before.pop() as VCSSSelectorValueNode,
                            parentSelector.shift() as VCSSTypeSelector,
                            after.shift() as VCSSTypeSelector,
                            nestingNode,
                        ),
                    )
                } else {
                    if (needJoinLeft) {
                        // concat left (e.g. `bar { @nest .foo-& {} }` -> .foo-bar)
                        before.push(
                            newNestingConcatLeftSelectorNodes(
                                before.pop() as VCSSSelectorValueNode,
                                parentSelector.shift() as VCSSTypeSelector,
                                nestingNode,
                            ),
                        )
                    }
                    if (needJoinRight) {
                        // concat right (e.g. `.foo { @nest &-bar {} }` -> .foo-bar)
                        after.unshift(
                            newNestingConcatRightSelectorNodes(
                                parentSelector.pop() as VCSSSelectorValueNode,
                                after.shift() as VCSSTypeSelector,
                                nestingNode,
                            ),
                        )
                    }
                }
                return new ResolvedSelector(owner, [
                    ...before,
                    ...parentSelector,
                    ...after,
                ])
            })
        } else {
            const before = [...beforeSelector]
            const after = [...afterSelector]
            while (isDescendantCombinator(before[0])) {
                before.shift()
            }
            if (isDescendantCombinator(after[0])) {
                while (isDescendantCombinator(before[before.length - 1])) {
                    before.pop()
                }
            }
            while (before.length === 0 && isDescendantCombinator(after[0])) {
                after.shift()
            }
            while (isDescendantCombinator(after[after.length - 1])) {
                after.pop()
            }
            resolved = [new ResolvedSelector(owner, [...before, ...after])]
        }

        let nestingTargetNode: VCSSSelectorNode = nestingNode
        while (!selectorNodes.includes(nestingTargetNode)) {
            const parent = nestingTargetNode.parent as
                | VCSSSelector
                | VCSSSelectorPseudo
            const index: number = parent.parent.nodes.indexOf(parent as never)
            const before = parent.parent.nodes.slice(
                0,
                index,
            ) as VCSSSelectorNode[]
            const after = parent.parent.nodes.slice(
                index + 1,
            ) as VCSSSelectorNode[]
            resolved = resolved.map((selector) => {
                const newNode = parent.copy()
                newNode.nodes = selector.selector as never
                return new ResolvedSelector(owner, [
                    ...before,
                    newNode,
                    ...after,
                ])
            })
            nestingTargetNode = parent
        }
        return resolved
    }
}

/**
 * Creates a selector node that concat the left and right selectors of the parent selector and the nested selector.
 */
function newNestingConcatBothSelectorNodes(
    left: VCSSSelectorValueNode,
    parent: VCSSTypeSelector,
    right: VCSSTypeSelector,
    _nesting: VCSSNestingSelector,
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
 * Creates a selector node that concat the left selectors of the parent selector and the nested selector.
 */
function newNestingConcatLeftSelectorNodes(
    left: VCSSSelectorValueNode,
    parent: VCSSTypeSelector,
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
 * Creates a selector node that concat the right selectors of the parent selector and the nested selector.
 */
function newNestingConcatRightSelectorNodes(
    parent: VCSSSelectorValueNode,
    right: VCSSTypeSelector,
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
