import {
    VCSSAtRule,
    VCSSNode,
    VCSSStyleRule,
    VCSSContainerNode,
    VCSSStyleSheet,
} from "../ast"

/**
 * Checks whether the given node is VCSSAtRule
 * @param node node to check
 */
export function isVCSSAtRule(node: VCSSNode | null): node is VCSSAtRule {
    return node?.type === "VCSSAtRule"
}
/**
 * Checks whether the given node is VCSSStyleRule
 * @param node node to check
 */
export function isVCSSStyleRule(node: VCSSNode | null): node is VCSSStyleRule {
    return node?.type === "VCSSStyleRule"
}
/**
 * Checks whether the given node is VCSSStyleSheet
 * @param node node to check
 */
export function isVCSSStyleSheet(
    node: VCSSNode | null,
): node is VCSSStyleSheet {
    return node?.type === "VCSSStyleSheet"
}
/**
 * Checks whether the given node has nodes node
 * @param node node to check
 */
export function isVCSSContainerNode(
    node: VCSSNode | null,
): node is VCSSContainerNode {
    return (
        isVCSSAtRule(node) ||
        isVCSSStyleRule(node) ||
        isVCSSStyleSheet(node) ||
        node?.type === "VCSSUnknown"
    )
}
