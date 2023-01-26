import type { ValidStyleContext } from "../styles/context";
import {
  getStyleContexts,
  getCommentDirectivesReporter,
  isValidStyleContext,
} from "../styles/context";
import type { RuleContext, RuleListener } from "../types";
import type { VGlobalPseudo } from "../styles/utils/selectors";
import {
  isPseudoEmptyArguments,
  isVGlobalPseudo,
} from "../styles/utils/selectors";

export = {
  meta: {
    docs: {
      description: "require selector argument to be passed to `::v-global()`",
      categories: ["vue3-recommended"],
      default: "warn",
      url: "https://future-architect.github.io/eslint-plugin-vue-scoped-css/rules/require-v-global-argument.html",
    },
    fixable: null,
    messages: {
      missingArguments:
        "Need to pass argument to the `::v-global` pseudo-element.",
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
     * Reports the given node
     * @param {ASTNode} node node to report
     */
    function report(node: VGlobalPseudo) {
      reporter.report({
        node,
        loc: node.loc,
        messageId: "missingArguments",
      });
    }

    /**
     * Verify the style
     */
    function verify(style: ValidStyleContext) {
      style.traverseSelectorNodes({
        enterNode(node) {
          if (isVGlobalPseudo(node) && isPseudoEmptyArguments(node)) {
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
