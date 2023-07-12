import type {
  VCSSAtRule,
  VCSSNode,
  VCSSStyleRule,
  VCSSContainerNode,
  VCSSStyleSheet,
  VCSSSelectorNode,
  VCSSSelector,
  VCSSSelectorPseudo,
  VCSSDeclarationProperty,
  VCSSComment,
} from "../ast";
import { isNestingAtRule } from "./selectors";

/**
 * Checks whether the given node is VCSSAtRule
 * @param node node to check
 */
export function isVCSSAtRule(
  node: VCSSNode | VCSSSelector | VCSSSelectorPseudo | null,
): node is VCSSAtRule {
  return node?.type === "VCSSAtRule";
}
/**
 * Checks whether the given node is VCSSStyleRule
 * @param node node to check
 */
export function isVCSSStyleRule(
  node: VCSSNode | VCSSSelector | VCSSSelectorPseudo | null,
): node is VCSSStyleRule {
  return node?.type === "VCSSStyleRule";
}
/**
 * Checks whether the given node is VCSSStyleSheet
 * @param node node to check
 */
export function isVCSSStyleSheet(
  node: VCSSNode | null,
): node is VCSSStyleSheet {
  return node?.type === "VCSSStyleSheet";
}
/**
 * Checks whether the given node is VCSSDeclarationProperty
 * @param node node to check
 */
export function isVCSSDeclarationProperty(
  node: VCSSNode | null,
): node is VCSSDeclarationProperty {
  return node?.type === "VCSSDeclarationProperty";
}
/**
 * Checks whether the given node is VCSSComment
 * @param node node to check
 */
export function isVCSSComment(node: VCSSNode | null): node is VCSSComment {
  return node?.type === "VCSSComment" || node?.type === "VCSSInlineComment";
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
  );
}

/**
 * Checks whether the given node has selectors.
 */
export function hasSelectorNodes(
  node: VCSSNode | VCSSSelector | VCSSSelectorPseudo,
): node is
  | (VCSSAtRule & { name: "nest"; selectors: VCSSSelectorNode[] })
  | VCSSStyleRule {
  if (isVCSSStyleRule(node) || isNestingAtRule(node)) {
    return true;
  }
  return false;
}
