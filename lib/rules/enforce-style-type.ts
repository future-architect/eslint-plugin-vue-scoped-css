import lodash from "lodash";
import type {
  RuleContext,
  AST,
  TokenStore,
  RuleListener,
  RuleFixer,
} from "../types";
import {
  getStyleContexts,
  isValidStyleContext,
  getCommentDirectivesReporter,
} from "../styles/context";

const styleTypesAttrs = ["scoped", "module"] as const;
type StyleTypes = "plain" | (typeof styleTypesAttrs)[number];
type AllowsOption = StyleTypes[];

export = {
  meta: {
    docs: {
      description:
        "enforce the `<style>` tags to be plain or have the `scoped` or `module` attribute",
      categories: ["recommended", "vue3-recommended"],
      default: "warn",
      url: "https://future-architect.github.io/eslint-plugin-vue-scoped-css/rules/enforce-style-type.html",
      suggestion: true,
    },
    fixable: null,
    messages: {
      add: "Add attribute `{{ attribute }}`.",
      remove: "Remove attribute `{{ attribute }}`.",
      removeMultiple: "Remove attributes {{ attributes }}.",
      change: "Change `{{ fromAttribute }}` to `{{ toAttribute }}` attribute.",
      forbiddenStyle: "`{{ attribute }}` attribute is forbidden.",
      forbiddenPlain: "Missing attribute {{ attributes }}.",
      forbiddenScopedModule:
        "Cannot use both `scoped` and `module` attributes.",
    },
    schema: [
      {
        type: "object",
        properties: {
          allows: {
            type: "array",
            minItems: 1,
            uniqueItems: true,
            items: {
              type: "string",
              enum: ["plain", "scoped", "module"],
            },
          },
        },
        additionalProperties: false,
      },
    ],
    type: "suggestion",
    hasSuggestions: true,
  },
  create(context: RuleContext): RuleListener {
    const styles = getStyleContexts(context).filter(isValidStyleContext);
    if (!styles.length) {
      return {};
    }

    const reporter = getCommentDirectivesReporter(context);
    const tokenStore =
      context.parserServices.getTemplateBodyTokenStore?.() as TokenStore;
    const { options } = context;

    const allows: AllowsOption = options[0]?.allows ?? ["scoped"];
    const singleAllow = allows.length === 1 && allows[0];

    /**
     * Fixer util to remove an attribute/directive and whitespace
     * @param {RuleFixer} fixer
     * @param {AST.VElement | AST.VDirective} node
     */
    function removeAttr(
      fixer: RuleFixer,
      node: AST.VAttribute | AST.VDirective
    ) {
      const { attributes } = node.parent;
      const prevToken = tokenStore.getTokenBefore(node);
      const nextToken = tokenStore.getTokenAfter(node);
      return [
        // Remove whitespace + node (+ whitespace)
        fixer.removeRange([
          prevToken.range[1],
          attributes.length === 1 ? nextToken.range[0] : node.range[1],
        ]),
      ];
    }

    /**
     * Reports the given node.
     * @param {AST.VElement} node node to report
     * @param {StyleTypes} attribute type of style
     */
    function reportForbiddenStyle(node: AST.VElement, attribute: StyleTypes) {
      const forbiddenAttr = node.startTag.attributes.find(
        (attr) => attr.key.name === attribute
      );
      const forbiddenAttrName = forbiddenAttr!.key.name as string;

      reporter.report({
        node: forbiddenAttr!,
        messageId: "forbiddenStyle",
        data: {
          attribute,
        },
        suggest: [
          singleAllow && singleAllow !== "plain"
            ? {
                messageId: "change",
                data: {
                  fromAttribute: forbiddenAttrName,
                  toAttribute: singleAllow,
                },
                fix(fixer: RuleFixer) {
                  return fixer.replaceText(forbiddenAttr, singleAllow);
                },
              }
            : {
                messageId: "remove",
                data: {
                  attribute: forbiddenAttrName,
                },
                fix(fixer: RuleFixer) {
                  return removeAttr(fixer, forbiddenAttr!);
                },
              },
        ],
      });
    }

    /**
     * Reports the given node.
     * @param {AST.VElement} node node to report
     */
    function reportForbiddenPlain(node: AST.VElement) {
      reporter.report({
        node: node.startTag,
        messageId: "forbiddenPlain",
        data: {
          attributes: allows.map((allow) => `\`${allow}\``).join(" or "),
        },
        suggest: singleAllow
          ? [
              {
                messageId: "add",
                data: {
                  attribute: singleAllow,
                },
                fix(fixer: RuleFixer) {
                  const close = tokenStore.getLastToken(node.startTag);
                  return (
                    close && fixer.insertTextBefore(close, ` ${singleAllow}`)
                  );
                },
              },
            ]
          : undefined,
      });
    }

    /**
     * Reports the given node.
     * @param {AST.VElement} node node to report
     */
    function reportForbiddenScopedModule(node: AST.VElement) {
      const forbiddenAttrs = node.startTag.attributes.filter(
        (attr) =>
          styleTypesAttrs.includes(
            attr.key.name as (typeof styleTypesAttrs)[number]
          ) && !allows.includes(attr.key.name as StyleTypes)
      );

      reporter.report({
        node: node.startTag,
        messageId: "forbiddenScopedModule",
        suggest: forbiddenAttrs.length
          ? [
              forbiddenAttrs.length === 1
                ? {
                    messageId: "remove",
                    data: {
                      attribute: forbiddenAttrs[0].key.name.toString(),
                    },
                    fix(fixer: RuleFixer) {
                      return removeAttr(fixer, forbiddenAttrs[0]);
                    },
                  }
                : {
                    messageId: "removeMultiple",
                    data: {
                      attributes: forbiddenAttrs
                        .map((attr) => `\`${attr.key.name}\``)
                        .join(", "),
                    },
                    fix(fixer: RuleFixer) {
                      return lodash.flatMap(forbiddenAttrs, (attr) =>
                        removeAttr(fixer, attr)
                      );
                    },
                  },
            ]
          : undefined,
      });
    }

    return {
      "Program:exit"() {
        for (const style of styles) {
          if (style.scoped && style.module) {
            reportForbiddenScopedModule(style.styleElement);
          } else if (style.scoped) {
            if (!allows.includes("scoped")) {
              reportForbiddenStyle(style.styleElement, "scoped");
            }
          } else if (style.module) {
            if (!allows.includes("module")) {
              reportForbiddenStyle(style.styleElement, "module");
            }
          } else {
            if (!allows.includes("plain")) {
              reportForbiddenPlain(style.styleElement);
            }
          }
        }
      },
    };
  },
};
