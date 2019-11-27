import {
    VCSSSelectorNode,
    VCSSIDSelector,
    VCSSClassSelector,
    VCSSUniversalSelector,
    VCSSNestingSelector,
    VCSSSelectorCombinator,
    VCSSAtRule,
    VCSSNode,
    VCSSTypeSelector,
    VCSSSelectorContainerNode,
    VCSSSelectorPseudo,
    VCSSSelectorValueNode,
} from "../ast"
import { isVCSSAtRule } from "./css-nodes"

/**
 * Checks whether the given node is VCSSTypeSelector
 * @param node node to check
 */
export function hasNodesSelector(
    node: VCSSSelectorNode | null,
): node is VCSSSelectorContainerNode {
    return (
        node != null &&
        (node.type === "VCSSSelector" || node.type === "VCSSSelectorPseudo")
    )
}

type VDeepPseudo = VCSSSelectorPseudo & { value: "::v-deep" }

/**
 * Checks whether the given node is ::v-deep pseudo
 * @param node node to check
 */
export function isVDeepPseudo(
    node: VCSSSelectorNode | null,
): node is VDeepPseudo {
    if (isPseudo(node)) {
        const val = node.value.trim()
        return val === "::v-deep"
    }
    return false
}

/**
 * Checks whether the given node is VCSSTypeSelector
 * @param node node to check
 */
export function isTypeSelector(
    node: VCSSSelectorNode | null,
): node is VCSSTypeSelector {
    return node?.type === "VCSSTypeSelector"
}

/**
 * Checks whether the given node is VCSSIDSelector
 * @param node node to check
 */
export function isIDSelector(
    node: VCSSSelectorNode | null,
): node is VCSSIDSelector {
    return node?.type === "VCSSIDSelector"
}

/**
 * Checks whether the given node is VCSSSelectorNode
 * @param node node to check
 */
export function isClassSelector(
    node: VCSSSelectorNode | null,
): node is VCSSClassSelector {
    return node?.type === "VCSSClassSelector"
}

/**
 * Checks whether the given node is VCSSUniversalSelector
 * @param node node to check
 */
export function isUniversalSelector(
    node: VCSSSelectorNode | null,
): node is VCSSUniversalSelector {
    return node?.type === "VCSSUniversalSelector"
}

/**
 * Checks whether the given node is VCSSNestingSelector
 * @param node node to check
 */
export function isNestingSelector(
    node: VCSSSelectorNode | null,
): node is VCSSNestingSelector {
    return node?.type === "VCSSNestingSelector"
}

/**
 * Checks whether the given node is VCSSNestingSelector
 * @param node node to check
 */
export function isPseudo(
    node: VCSSSelectorNode | null,
): node is VCSSSelectorPseudo {
    return node?.type === "VCSSSelectorPseudo"
}
/**
 * Checks whether the given node is VCSSSelectorCombinator
 * @param node node to check
 */
export function isSelectorCombinator(
    node: VCSSSelectorNode | null,
): node is VCSSSelectorCombinator | VDeepPseudo {
    return node?.type === "VCSSSelectorCombinator" || isVDeepPseudo(node)
}

/**
 * Checks whether the given node is descendant combinator
 * @param node node to check
 */
export function isDescendantCombinator(
    node: VCSSSelectorNode | null,
): node is VCSSSelectorCombinator & { value: " " } {
    return isSelectorCombinator(node) && node.value.trim() === ""
}

/**
 * Checks whether the given node is child combinator
 * @param node node to check
 */
export function isChildCombinator(
    node: VCSSSelectorNode | null,
): node is VCSSSelectorCombinator & { value: ">" } {
    return isSelectorCombinator(node) && node.value.trim() === ">"
}

/**
 * Checks whether the given node is adjacent sibling combinator
 * @param node node to check
 */
export function isAdjacentSiblingCombinator(
    node: VCSSSelectorNode | null,
): node is VCSSSelectorCombinator & { value: "+" } {
    return isSelectorCombinator(node) && node.value.trim() === "+"
}

/**
 * Checks whether the given node is general sibling combinator
 * @param node node to check
 */
export function isGeneralSiblingCombinator(
    node: VCSSSelectorNode | null,
): node is VCSSSelectorCombinator & { value: "~" } {
    return isSelectorCombinator(node) && node.value.trim() === "~"
}

/**
 * Checks whether the given node is deep combinator
 * @param node node to check
 */
export function isDeepCombinator(
    node: VCSSSelectorNode | null,
): node is
    | (VCSSSelectorCombinator & { value: ">>>" | "/deep/" })
    | VDeepPseudo {
    if (isSelectorCombinator(node)) {
        const val = node.value.trim()
        return val === ">>>" || val === "/deep/" || isVDeepPseudo(node)
    }
    return false
}

/**
 * Checks whether the given node is nesting atrule
 * @param node node to check
 */
export function isNestingAtRule(
    node: VCSSNode | null,
): node is VCSSAtRule & { name: "nest"; selectors: VCSSSelectorNode[] } {
    if (node == null) {
        return false
    }
    return isVCSSAtRule(node) && node.name === "nest" && node.identifier === "@"
}

export type NestingInfo = {
    node: VCSSNestingSelector
    nodes: VCSSSelectorValueNode[]
    nestingIndex: number
}
/**
 * Find nesting selectors
 * @param {Node[]} nodes selector nodes
 * @returns {IterableIterator<NestingInfo>} nesting selectors info
 */
export function* findNestingSelectors(
    nodes: VCSSSelectorValueNode[],
): IterableIterator<NestingInfo> {
    for (const node of nodes) {
        if (isNestingSelector(node)) {
            yield {
                nestingIndex: nodes.indexOf(node),
                node,
                nodes,
            }
        }
        if (hasNodesSelector(node)) {
            yield* findNestingSelectors(node.nodes)
        }
    }
}

/**
 * Find nesting selector
 */
export function findNestingSelector(
    nodes: VCSSSelectorValueNode[],
): NestingInfo | null {
    for (const nest of findNestingSelectors(nodes)) {
        return nest
    }
    return null
}
