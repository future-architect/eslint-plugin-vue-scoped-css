import type { RuleContext, Rule } from "../types";
import type { VCSSParsingError } from "../styles/ast";
import type { InvalidStyleContext } from "../styles/context";
import {
  getStyleContexts,
  getCommentDirectivesReporter,
} from "../styles/context";

declare const module: {
  exports: Rule;
};

module.exports = {
  meta: {
    docs: {
      description: "disallow parsing errors in `<style>`",
      categories: ["recommended", "vue3-recommended"],
      default: "warn",
      url: "https://future-architect.github.io/eslint-plugin-vue-scoped-css/rules/no-parsing-error.html",
    },
    fixable: null,
    messages: {},
    schema: [],
    type: "problem",
  },
  create(context: RuleContext) {
    const styles = getStyleContexts(context);
    if (!styles.length) {
      return {};
    }
    const reporter = getCommentDirectivesReporter(context);

    /**
     * Reports the given node
     * @param {ASTNode} node node to report
     */
    function report(node: VCSSParsingError) {
      reporter.report({
        node,
        loc: node.loc.start,
        message: "Parsing error: {{message}}.",
        data: {
          message: node.message.endsWith(".")
            ? node.message.slice(0, -1)
            : node.message,
        },
      });
    }

    /**
     * Reports the given style
     * @param {ASTNode} node node to report
     */
    function reportInvalidStyle(style: InvalidStyleContext) {
      reporter.report({
        node: style.styleElement,
        loc: style.invalid.loc,
        message: "Parsing error: {{message}}.",
        data: {
          message: style.invalid.message,
        },
      });
    }

    return {
      "Program:exit"() {
        for (const style of styles) {
          if (style.invalid != null) {
            if (style.invalid.needReport) {
              reportInvalidStyle(style);
            }
          } else {
            for (const node of style.cssNode?.errors || []) {
              report(node);
            }
          }
        }
      },
    };
  },
};
