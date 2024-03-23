import type { ResolvedSelector } from "../styles/selectors";
import { getResolvedSelectors } from "../styles/selectors";
import type { VCSSSelectorNode, VCSSSelectorCombinator } from "../styles/ast";
import {
  isTypeSelector,
  isIDSelector,
  isClassSelector,
  isUniversalSelector,
  isSelectorCombinator,
  isChildCombinator,
  isAdjacentSiblingCombinator,
  isGeneralSiblingCombinator,
  isDeepCombinator,
  isVueSpecialPseudo,
  isVDeepPseudo,
  isVSlottedPseudo,
  isVGlobalPseudo,
  isDescendantCombinator,
} from "../styles/utils/selectors";
import type { QueryContext } from "../styles/selectors/query";
import { createQueryContext } from "../styles/selectors/query";
import { isRootElement } from "../styles/selectors/query/elements";
import type { RuleContext, RuleListener } from "../types";
import { parseQueryOptions } from "../options";
import type { ValidStyleContext } from "../styles/context";
import {
  getStyleContexts,
  getCommentDirectivesReporter,
} from "../styles/context";
import { hasTemplateBlock, isDefined } from "../utils/utils";
import { isValidStyleContext } from "../styles/context/style";

/**
 * Gets scoped selectors.
 * @param {StyleContext} style The style context
 * @returns {VCSSSelectorNode[][]} selectors
 */
function getScopedSelectors(style: ValidStyleContext): VCSSSelectorNode[][] {
  const resolvedSelectors = getResolvedSelectors(style);
  return resolvedSelectors.map(getScopedSelector).filter(isDefined);
}

/**
 * Gets scoped selector.
 * @param resolvedSelector CSS selector
 * @returns scoped selector
 */
function getScopedSelector(
  resolvedSelector: ResolvedSelector,
): VCSSSelectorNode[] | null {
  const { selector } = resolvedSelector;
  const specialNodeIndex = selector.findIndex(
    (s) => isDeepCombinator(s) || isVueSpecialPseudo(s),
  );
  let scopedCandidateSelector: VCSSSelectorNode[];
  if (specialNodeIndex >= 0) {
    const specialNode = selector[specialNodeIndex];
    if (isDeepCombinator(specialNode) || isVDeepPseudo(specialNode)) {
      scopedCandidateSelector = selector.slice(0, specialNodeIndex);

      const last = scopedCandidateSelector.pop();
      if (last && !isDescendantCombinator(last)) {
        scopedCandidateSelector.push(last);
      }
    } else if (isVSlottedPseudo(specialNode)) {
      scopedCandidateSelector = selector.slice(0, specialNodeIndex + 1);
    } else if (isVGlobalPseudo(specialNode)) {
      return null;
    } else {
      scopedCandidateSelector = [...selector];
    }
  } else {
    scopedCandidateSelector = [...selector];
  }

  const results = [];
  for (const sel of scopedCandidateSelector.reverse()) {
    if (isSelectorCombinator(sel)) {
      if (
        !isChildCombinator(sel) &&
        !isAdjacentSiblingCombinator(sel) &&
        !isGeneralSiblingCombinator(sel)
      ) {
        break;
      }
    }

    results.push(sel);
  }
  return results.reverse();
}

export = {
  meta: {
    docs: {
      description:
        "disallow selectors defined in Scoped CSS that don't use in `<template>`",
      categories: ["vue2-recommended", "vue3-recommended"],
      default: "warn",
      url: "https://future-architect.github.io/eslint-plugin-vue-scoped-css/rules/no-unused-selector.html",
    },
    fixable: null,
    messages: {
      unused: "The selector `{{selector}}` is unused.",
    },
    schema: [
      {
        type: "object",
        properties: {
          ignoreBEMModifier: {
            type: "boolean",
          },
          captureClassesFromDoc: {
            type: "array",
            items: [
              {
                type: "string",
              },
            ],
            minItems: 0,
            uniqueItems: true,
          },
          checkUnscoped: {
            type: "boolean",
          },
        },
        additionalProperties: false,
      },
    ],
    type: "suggestion", // "problem",
  },
  create(context: RuleContext): RuleListener {
    if (!hasTemplateBlock(context)) {
      return {};
    }
    const checkUnscoped = Boolean(context.options[0]?.checkUnscoped);
    const styles = getStyleContexts(context)
      .filter(isValidStyleContext)
      .filter((style) => style.scoped || checkUnscoped);
    if (!styles.length) {
      return {};
    }
    const reporter = getCommentDirectivesReporter(context);

    const reportedSet = new Set<VCSSSelectorNode>();

    /**
     * Reports the given nodes.
     * @param {ASTNode} nodes nodes to report
     */
    function report(nodes: VCSSSelectorNode[]) {
      if (!reportedSet.has(nodes[0])) {
        reporter.report({
          loc: {
            start: nodes[0].loc.start,
            end: nodes[nodes.length - 1].loc.end,
          },
          messageId: "unused",
          data: {
            selector: nodes.map((n) => n.selector).join(""),
          },
        });
        reportedSet.add(nodes[0]);
      }
    }

    /**
     * Verify the selector
     */
    function verifySelector(
      queryContext: QueryContext,
      scopedSelector: VCSSSelectorNode[],
    ) {
      const reportSelectorNodes: VCSSSelectorNode[] = [];
      let targetsQueryContext = queryContext;
      let reverseVerifySelector = [...scopedSelector].reverse();
      while (reverseVerifySelector.length) {
        const combIndex = reverseVerifySelector.findIndex(isSelectorCombinator);
        let comb: VCSSSelectorCombinator | null = null;
        let selectorBlock: VCSSSelectorNode[] = [];

        if (combIndex >= 0) {
          // `> .a.b` -> comb=">" , selectorBlock=[".a", ".b"]
          comb = reverseVerifySelector[combIndex] as VCSSSelectorCombinator;
          selectorBlock = reverseVerifySelector.slice(0, combIndex);

          // Setup the selectors to verify at the next.
          reverseVerifySelector = reverseVerifySelector.slice(combIndex + 1);
        } else {
          // `.a.b` -> comb=null , selectorBlock=[".a", ".b"]
          selectorBlock = reverseVerifySelector;

          // There is no selectors to verify at the next.
          reverseVerifySelector = [];
        }

        const classSelectors = selectorBlock.filter(isClassSelector);
        const notClassSelectors = selectorBlock.filter(
          (s) =>
            // Filter verify target selector
            // Other selectors are ignored because they are likely to be changed dynamically.
            isSelectorCombinator(s) ||
            isTypeSelector(s) ||
            isIDSelector(s) ||
            isUniversalSelector(s) ||
            isVueSpecialPseudo(s),
        );

        for (const selectorNode of notClassSelectors) {
          targetsQueryContext =
            targetsQueryContext.reverseQueryStep(selectorNode);
        }

        const roots = targetsQueryContext.filter(isRootElement);
        if (roots.elements.length) {
          // The root element can add classes by defining a parent.
          // The root element is considered to match if it matches at least one Class Selector.
          for (const selectorNode of classSelectors) {
            if (roots.reverseQueryStep(selectorNode).elements.length) {
              return;
            }
          }
        }
        for (const selectorNode of classSelectors) {
          targetsQueryContext =
            targetsQueryContext.reverseQueryStep(selectorNode);
        }
        reportSelectorNodes.push(...selectorBlock);
        if (comb) {
          if (!targetsQueryContext.elements.length) {
            // to report
            break;
          }
          if (targetsQueryContext.elements.some(isRootElement)) {
            return;
          }
          targetsQueryContext = targetsQueryContext.reverseQueryStep(comb);
          reportSelectorNodes.push(comb);
        }
      }
      if (!targetsQueryContext.elements.length) {
        report(reportSelectorNodes.reverse());
      }
    }

    return {
      "Program:exit"() {
        const queryContext = createQueryContext(
          context,
          parseQueryOptions(context.options[0]),
        );

        for (const style of styles) {
          for (const scopedSelector of getScopedSelectors(style)) {
            verifySelector(queryContext, scopedSelector);
          }
        }
      },
    };
  },
};
