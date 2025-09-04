import type { RuleContext, AST } from "../../../types";
import { isVDirective, isVBind, getArgument } from "../../../utils/templates";
import type { ReferenceExpressions } from "./reference-expression";
import { getReferenceExpressions } from "./reference-expression";

/**
 * Gets the value nodes of attribute of given name as Array. Returns `null` If the given name can not be identified.
 * @param {VElement} element the element
 * @param {string} name name to search
 * @param {RuleContext} context ESLint rule context
 * @returns {ASTNode[]} the value nodes of attribute of given name as Array. `null` If the given name can not be identified.
 */
export function getAttributeValueNodes(
  element: AST.VElement,
  name: string,
  context: RuleContext,
): AttributeValueExpressions[] | null {
  const results: AttributeValueExpressions[] = [];
  const lowedName = name.toLowerCase();
  const { startTag } = element;
  for (const attr of startTag.attributes) {
    if (!isVDirective(attr)) {
      const { key, value } = attr;
      if (value == null) {
        continue;
      }
      if (key.name === lowedName) {
        results.push(value);
      }
    } else {
      const { key, value } = attr;
      if (value == null) {
        continue;
      }
      if (!isVBind(key)) {
        continue;
      }
      const bindArg = getArgument(key);
      if (bindArg == null) {
        // bind name is unknown.
        return null;
      }
      if (bindArg !== lowedName) {
        continue;
      }
      const { expression } = value;
      if (expression == null) {
        // empty or syntax error
        continue;
      }
      if (expression.type === "VGenericExpression") continue;
      const expressions = getReferenceExpressions(expression, context);
      if (!expressions) {
        // Expressions not found.
        return null;
      }
      for (const e of expressions) {
        results.push(e);
      }
    }
  }
  return results;
}

export type AttributeValueExpressions = ReferenceExpressions | AST.VLiteral;
