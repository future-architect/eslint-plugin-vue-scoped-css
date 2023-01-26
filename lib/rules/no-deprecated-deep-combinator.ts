import type { ValidStyleContext } from "../styles/context";
import {
  getStyleContexts,
  getCommentDirectivesReporter,
  isValidStyleContext,
} from "../styles/context";
import type { VCSSSelectorCombinator } from "../styles/ast";
import type { RuleContext, Range, RuleListener } from "../types";
import { isDeepCombinator } from "../styles/utils/selectors";

export = {
  meta: {
    docs: {
      description: "disallow using deprecated deep combinators",
      categories: ["vue3-recommended"],
      default: "warn",
      url: "https://future-architect.github.io/eslint-plugin-vue-scoped-css/rules/no-deprecated-deep-combinator.html",
    },
    fixable: "code",
    messages: {
      deprecated: "The deep combinator `{{value}}` is deprecated.",
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
    function report(node: VCSSSelectorCombinator) {
      reporter.report({
        node,
        loc: node.loc,
        messageId: "deprecated",
        data: {
          value: node.value.trim(),
        },
        fix(fixer) {
          const sourceCodeText = context.getSourceCode().text;
          const range = [...node.range] as Range;
          let newText = "::v-deep";
          if (sourceCodeText[range[0] - 1]?.trim()) {
            newText = ` ${newText}`;
          }
          if (sourceCodeText[range[1]]?.trim()) {
            newText = `${newText} `;
          }

          return fixer.replaceTextRange(range, newText);
        },
      });
    }

    /**
     * Verify the style
     */
    function verify(style: ValidStyleContext) {
      style.traverseSelectorNodes({
        enterNode(node) {
          if (isDeepCombinator(node)) {
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
