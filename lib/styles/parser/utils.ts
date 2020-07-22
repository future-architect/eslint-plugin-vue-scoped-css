import type {
    PostCSSNode,
    PostCSSContainer,
    PostCSSSPNode,
    PostCSSSPContainer,
} from "../../types"

/**
 * Checks if the given node has nodes property.
 */
export function isPostCSSContainer(
    node: PostCSSNode,
): node is PostCSSContainer {
    return (node as any).nodes != null
}

/**
 * Checks if the given node has nodes property.
 */
export function isPostCSSSPContainer(
    node: PostCSSSPNode,
): node is PostCSSSPContainer {
    return (node as any).nodes != null
}
