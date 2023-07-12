import type {
  VCSSSelectorNode,
  VCSSIDSelector,
  VCSSClassSelector,
  VCSSUniversalSelector,
  VCSSNestingSelector,
  VCSSSelectorCombinator,
  VCSSAtRule,
  VCSSNode,
  VCSSTypeSelector,
  VCSSSelectorPseudo,
  VCSSSelectorValueNode,
} from "../ast";
import { VCSSSelector } from "../ast";
import { isVCSSAtRule } from "./css-nodes";
import type { SourceLocation } from "../../types";

/**
 * Checks whether the given node is VCSSTypeSelector
 * @param node node to check
 */
export function hasNodesSelector(
  node: VCSSSelectorNode | null,
): node is VCSSSelector | VCSSSelectorPseudo {
  return (
    node != null &&
    (node.type === "VCSSSelector" || node.type === "VCSSSelectorPseudo")
  );
}

/**
 * Returns the normalized result of Pseudo params.
 */
export function normalizePseudoParams(
  pseudo: VCSSSelectorPseudo,
  nodes: VCSSSelectorNode[],
): VCSSSelector[] {
  const results: VCSSSelector[] = [];
  let buffer: VCSSSelectorValueNode[] = [];
  for (const node of nodes) {
    if (node.type === "VCSSSelector") {
      if (buffer.length) {
        const startNode = buffer[0];
        const endNode = buffer[buffer.length - 1];
        const loc: SourceLocation = {
          start: startNode.loc.start,
          end: endNode.loc.end,
        };
        results.push(
          new VCSSSelector(
            buffer[0] as never,
            loc,
            startNode.start,
            endNode.end,
            {
              parent: pseudo,
              nodes: buffer,
            },
          ),
        );
        buffer = [];
      }
      results.push(node);
    } else {
      buffer.push(node);
    }
  }
  if (buffer.length) {
    const startNode = buffer[0];
    const endNode = buffer[buffer.length - 1];
    const loc: SourceLocation = {
      start: startNode.loc.start,
      end: endNode.loc.end,
    };
    results.push(
      new VCSSSelector(buffer[0] as never, loc, startNode.start, endNode.end, {
        parent: pseudo,
        nodes: buffer,
      }),
    );
    buffer = [];
  }
  return results;
}

export type VDeepPseudo = VCSSSelectorPseudo & { value: "::v-deep" | ":deep" };
export type VSlottedPseudo = VCSSSelectorPseudo & {
  value: "::v-slotted" | ":slotted";
};
export type VGlobalPseudo = VCSSSelectorPseudo & {
  value: "::v-global" | ":global";
};

/**
 * Checks whether the given node is ::v-deep or ::v-slotted or ::v-global pseudo
 * @param node node to check
 */
export function isVueSpecialPseudo(
  node: VCSSSelectorNode | null,
): node is VDeepPseudo | VSlottedPseudo | VGlobalPseudo {
  return isVDeepPseudo(node) || isVSlottedPseudo(node) || isVGlobalPseudo(node);
}

/**
 * Checks whether the given node is ::v-deep pseudo for Vue.js v2
 * @param node node to check
 */
export function isVDeepPseudoV2(
  node: VCSSSelectorNode | null,
): node is VDeepPseudo {
  if (isVDeepPseudo(node)) {
    return node.nodes.length === 0;
  }
  return false;
}

/**
 * Checks whether the given node is ::v-deep pseudo
 * @param node node to check
 */
export function isVDeepPseudo(
  node: VCSSSelectorNode | null,
): node is VDeepPseudo {
  if (isPseudo(node)) {
    const val = node.value.trim();
    return val === "::v-deep" || val === ":deep";
  }
  return false;
}
/**
 * Checks whether the given node is ::v-slotted pseudo
 * @param node node to check
 */
export function isVSlottedPseudo(
  node: VCSSSelectorNode | null,
): node is VSlottedPseudo {
  if (isPseudo(node)) {
    const val = node.value.trim();
    return val === "::v-slotted" || val === ":slotted";
  }
  return false;
}
/**
 * Checks whether the given node is ::v-global pseudo
 * @param node node to check
 */
export function isVGlobalPseudo(
  node: VCSSSelectorNode | null,
): node is VGlobalPseudo {
  if (isPseudo(node)) {
    const val = node.value.trim();
    return val === "::v-global" || val === ":global";
  }
  return false;
}

/**
 * Checks whether the given pseudo node is empty arguments
 * @param node node to check
 */
export function isPseudoEmptyArguments(node: VCSSSelectorPseudo): boolean {
  return (
    node.nodes.length === 0 ||
    (node.nodes.length === 1 && node.nodes[0].nodes.length === 0)
  );
}

/**
 * Checks whether the given node is VCSSTypeSelector
 * @param node node to check
 */
export function isTypeSelector(
  node: VCSSSelectorNode | null,
): node is VCSSTypeSelector {
  return node?.type === "VCSSTypeSelector";
}

/**
 * Checks whether the given node is VCSSIDSelector
 * @param node node to check
 */
export function isIDSelector(
  node: VCSSSelectorNode | null,
): node is VCSSIDSelector {
  return node?.type === "VCSSIDSelector";
}

/**
 * Checks whether the given node is VCSSSelectorNode
 * @param node node to check
 */
export function isClassSelector(
  node: VCSSSelectorNode | null,
): node is VCSSClassSelector {
  return node?.type === "VCSSClassSelector";
}

/**
 * Checks whether the given node is VCSSUniversalSelector
 * @param node node to check
 */
export function isUniversalSelector(
  node: VCSSSelectorNode | null,
): node is VCSSUniversalSelector {
  return node?.type === "VCSSUniversalSelector";
}

/**
 * Checks whether the given node is VCSSNestingSelector
 * @param node node to check
 */
export function isNestingSelector(
  node: VCSSSelectorNode | null,
): node is VCSSNestingSelector {
  return node?.type === "VCSSNestingSelector";
}

/**
 * Checks whether the given node is VCSSNestingSelector
 * @param node node to check
 */
export function isPseudo(
  node: VCSSSelectorNode | null,
): node is VCSSSelectorPseudo {
  return node?.type === "VCSSSelectorPseudo";
}

/**
 * Checks whether the given node is VCSSSelectorCombinator
 * @param node node to check
 */
export function isSelectorCombinator(
  node: VCSSSelectorNode | null,
): node is VCSSSelectorCombinator | VDeepPseudo {
  return node?.type === "VCSSSelectorCombinator";
}

/**
 * Checks whether the given node is descendant combinator
 * @param node node to check
 */
export function isDescendantCombinator(
  node: VCSSSelectorNode | null,
): node is VCSSSelectorCombinator & { value: " " } {
  return isSelectorCombinator(node) && node.value.trim() === "";
}

/**
 * Checks whether the given node is child combinator
 * @param node node to check
 */
export function isChildCombinator(
  node: VCSSSelectorNode | null,
): node is VCSSSelectorCombinator & { value: ">" } {
  return isSelectorCombinator(node) && node.value.trim() === ">";
}

/**
 * Checks whether the given node is adjacent sibling combinator
 * @param node node to check
 */
export function isAdjacentSiblingCombinator(
  node: VCSSSelectorNode | null,
): node is VCSSSelectorCombinator & { value: "+" } {
  return isSelectorCombinator(node) && node.value.trim() === "+";
}

/**
 * Checks whether the given node is general sibling combinator
 * @param node node to check
 */
export function isGeneralSiblingCombinator(
  node: VCSSSelectorNode | null,
): node is VCSSSelectorCombinator & { value: "~" } {
  return isSelectorCombinator(node) && node.value.trim() === "~";
}

/**
 * Checks whether the given node is deep combinator
 * @param node node to check
 */
export function isDeepCombinator(
  node: VCSSSelectorNode | null,
): node is VCSSSelectorCombinator & { value: ">>>" | "/deep/" } {
  if (isSelectorCombinator(node)) {
    const val = node.value.trim();
    return val === ">>>" || val === "/deep/";
  }
  return false;
}

/**
 * Checks whether the given node is nesting atrule
 * @param node node to check
 */
export function isNestingAtRule(
  node: VCSSNode | VCSSSelector | VCSSSelectorPseudo | null,
): node is VCSSAtRule & { name: "nest"; selectors: VCSSSelectorNode[] } {
  if (node == null) {
    return false;
  }
  return isVCSSAtRule(node) && node.name === "nest" && node.identifier === "@";
}

export type NestingInfo = {
  node: VCSSNestingSelector;
  nodes: VCSSSelectorNode[];
  nestingIndex: number;
};
/**
 * Find nesting selectors
 * @param {Node[]} nodes selector nodes
 * @returns {IterableIterator<NestingInfo>} nesting selectors info
 */
export function* findNestingSelectors(
  nodes: VCSSSelectorNode[],
): IterableIterator<NestingInfo> {
  for (const node of nodes) {
    if (isNestingSelector(node)) {
      yield {
        nestingIndex: nodes.indexOf(node as never),
        node,
        nodes,
      };
    }
    if (hasNodesSelector(node)) {
      yield* findNestingSelectors(node.nodes);
    }
  }
}

/**
 * Find nesting selector
 */
export function findNestingSelector(
  nodes: VCSSSelectorNode[],
): NestingInfo | null {
  for (const nest of findNestingSelectors(nodes)) {
    return nest;
  }
  return null;
}
