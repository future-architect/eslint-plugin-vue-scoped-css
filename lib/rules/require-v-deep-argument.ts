import type { ValidStyleContext } from "../styles/context";
import {
  getStyleContexts,
  getCommentDirectivesReporter,
  isValidStyleContext,
} from "../styles/context";
import type { RuleContext, Range, RuleListener } from "../types";
import type { VDeepPseudo } from "../styles/utils/selectors";
import {
  isVDeepPseudoV2,
  isVDeepPseudo,
  isPseudoEmptyArguments,
} from "../styles/utils/selectors";
import type {
  VCSSSelectorNode,
  VCSSAtRule,
  VCSSStyleRule,
} from "../styles/ast";
import {
  hasSelectorNodes,
  isVCSSAtRule,
  isVCSSDeclarationProperty,
  isVCSSComment,
} from "../styles/utils/css-nodes";

export = {
  meta: {
    docs: {
      description: "require selector argument to be passed to `::v-deep()`",
      categories: ["vue3-recommended"],
      default: "warn",
      url: "https://future-architect.github.io/eslint-plugin-vue-scoped-css/rules/require-v-deep-argument.html",
    },
    fixable: "code",
    messages: {
      missingArguments:
        "Need to pass argument to the `::v-deep` pseudo-element.",
    },
    schema: [],
    type: "suggestion", // "problem",
  },
  create(context: RuleContext): RuleListener {
    const styles = getStyleContexts(context)
      .filter(isValidStyleContext)
      .filter((style) => style.scoped);
    if (!styles.length) {
      return {};
    }
    const reporter = getCommentDirectivesReporter(context);

    /**
     * Find VCSSStyleRule or nest VCSSAtRule
     */
    function findHasSelectorsNode(
      node: VCSSSelectorNode
    ):
      | (VCSSAtRule & { name: "nest"; selectors: VCSSSelectorNode[] })
      | VCSSStyleRule
      | null {
      if (hasSelectorNodes(node.parent)) {
        return node.parent;
      }
      if (isVCSSAtRule(node.parent)) {
        return null;
      }
      return findHasSelectorsNode(node.parent);
    }

    /**
     * Reports the given node
     * @param {ASTNode} node node to report
     */
    function report(node: VDeepPseudo) {
      reporter.report({
        node,
        loc: node.loc,
        messageId: "missingArguments",
        fix(fixer) {
          if (!isVDeepPseudoV2(node)) {
            return null;
          }
          const nodes = node.parent.nodes;
          const selectorIndex = nodes.indexOf(node);
          const nextNode = nodes[selectorIndex + 1];
          if (!nextNode) {
            return null;
          }
          const betweenRange: Range = [
            node.range[0] + node.value.length,
            nextNode.range[0],
          ];
          if (
            context
              .getSourceCode()
              .text.slice(...betweenRange)
              .trim()
          ) {
            // ::v-deep /* comment */ .foo
            return null;
          }

          const ruleNode = findHasSelectorsNode(node);
          if (
            !ruleNode?.nodes.every(
              (n) => isVCSSDeclarationProperty(n) || isVCSSComment(n)
            )
          ) {
            // Maybe includes nesting
            return null;
          }

          const last = nodes[nodes.length - 1];
          return [
            fixer.removeRange(betweenRange),
            fixer.insertTextAfterRange(betweenRange, "("),
            fixer.insertTextAfterRange(last.range, ")"),
          ];
        },
      });
    }

    /**
     * Verify the style
     */
    function verify(style: ValidStyleContext) {
      style.traverseSelectorNodes({
        enterNode(node) {
          if (isVDeepPseudoV2(node)) {
            report(node);
          } else if (isVDeepPseudo(node) && isPseudoEmptyArguments(node)) {
            report(node);
          }
        },
      });
    }

    return {
      "Program:exit"() {
        for (const style of styles) {
          verify(style);
        }
      },
    };
  },
};
