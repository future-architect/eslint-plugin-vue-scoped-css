import type { ValidStyleContext } from "../styles/context";
import {
  getStyleContexts,
  getCommentDirectivesReporter,
  isValidStyleContext,
} from "../styles/context";
import type { RuleContext, RuleListener } from "../types";
import type { VSlottedPseudo } from "../styles/utils/selectors";
import {
  isVSlottedPseudo,
  isPseudoEmptyArguments,
} from "../styles/utils/selectors";

export = {
  meta: {
    docs: {
      description: "enforce `:slotted()`/`::v-slotted()` style",
      categories: [
        // TODO: enable in next major version
        // "vue3-recommended"
      ],
      default: "warn",
      url: "https://future-architect.github.io/eslint-plugin-vue-scoped-css/rules/v-slotted-pseudo-style.html",
    },
    fixable: "code",
    messages: {
      expectedSlotted: "Expected ':slotted()' instead of '::v-slotted()'.",
      expectedVSlotted: "Expected '::v-slotted()' instead of ':slotted()'.",
    },
    schema: [{ enum: [":slotted", "::v-slotted"] }],
    type: "suggestion",
  },
  create(context: RuleContext): RuleListener {
    const styles = getStyleContexts(context)
      .filter(isValidStyleContext)
      .filter((style) => style.scoped);
    if (!styles.length) {
      return {};
    }
    const expected = (context.options[0] || ":slotted") as
      | ":slotted"
      | "::v-slotted";
    const reporter = getCommentDirectivesReporter(context);

    /**
     * Reports the given node
     * @param {ASTNode} node node to report
     */
    function report(node: VSlottedPseudo) {
      reporter.report({
        node,
        loc: node.loc,
        messageId:
          expected === ":slotted" ? "expectedSlotted" : "expectedVSlotted",
        fix(fixer) {
          const nodeText = context.getSourceCode().text.slice(...node.range);
          return fixer.replaceTextRange(
            node.range,
            nodeText.replace(
              /^(\s*)(?::slotted|::v-slotted)(\s*\()/u,
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
    function verifyNode(node: VSlottedPseudo) {
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
          if (isVSlottedPseudo(node) && !isPseudoEmptyArguments(node)) {
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
