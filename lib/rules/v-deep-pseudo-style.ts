import type { ValidStyleContext } from "../styles/context";
import {
  getStyleContexts,
  getCommentDirectivesReporter,
  isValidStyleContext,
} from "../styles/context";
import type { RuleContext, RuleListener } from "../types";
import type { VDeepPseudo } from "../styles/utils/selectors";
import {
  isVDeepPseudo,
  isPseudoEmptyArguments,
} from "../styles/utils/selectors";

export = {
  meta: {
    docs: {
      description: "enforce `:deep()`/`::v-deep()` style",
      categories: [
        // TODO: enable in next major version
        // "vue3-recommended"
      ],
      default: "warn",
      url: "https://future-architect.github.io/eslint-plugin-vue-scoped-css/rules/v-deep-pseudo-style.html",
    },
    fixable: "code",
    messages: {
      expectedDeep: "Expected ':deep()' instead of '::v-deep()'.",
      expectedVDeep: "Expected '::v-deep()' instead of ':deep()'.",
    },
    schema: [{ enum: [":deep", "::v-deep"] }],
    type: "suggestion",
  },
  create(context: RuleContext): RuleListener {
    const styles = getStyleContexts(context)
      .filter(isValidStyleContext)
      .filter((style) => style.scoped);
    if (!styles.length) {
      return {};
    }
    const expected = (context.options[0] || ":deep") as ":deep" | "::v-deep";
    const reporter = getCommentDirectivesReporter(context);

    /**
     * Reports the given node
     * @param {ASTNode} node node to report
     */
    function report(node: VDeepPseudo) {
      reporter.report({
        node,
        loc: node.loc,
        messageId: expected === ":deep" ? "expectedDeep" : "expectedVDeep",
        fix(fixer) {
          const nodeText = context.getSourceCode().text.slice(...node.range);
          return fixer.replaceTextRange(
            node.range,
            nodeText.replace(
              /^(\s*)(?::deep|::v-deep)(\s*\()/u,
              (_, prefix: string, suffix: string) =>
                `${prefix}${expected}${suffix}`,
            ),
          );
        },
      });
    }

    /**
     * Verify the node
     */
    function verifyNode(node: VDeepPseudo) {
      if (node.value === expected) {
        return;
      }

      report(node);
    }

    /**
     * Verify the style
     */
    function verify(style: ValidStyleContext) {
      style.traverseSelectorNodes({
        enterNode(node) {
          if (isVDeepPseudo(node) && !isPseudoEmptyArguments(node)) {
            verifyNode(node);
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
