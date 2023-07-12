import { getVueComponentContext } from "../../context";
import type { RuleContext, AST } from "../../../types";

export type ReferenceExpressions =
  | AST.ESLintExpression
  | AST.VFilterSequenceExpression
  | AST.VForExpression
  | AST.VOnExpression
  | AST.VSlotScopeExpression;
/**
 * Gets the reference expressions to the given expression.
 * @param {ASTNode} expression expression to track
 * @param {RuleContext} context ESLint rule context
 * @returns {ASTNode[]} reference expressions.
 */
export function getReferenceExpressions(
  expression: ReferenceExpressions,
  context: RuleContext,
): ReferenceExpressions[] | null {
  if (expression.type === "ConditionalExpression") {
    const { consequent, alternate } = expression;
    return [
      ...(getReferenceExpressions(consequent, context) ?? [consequent]),
      ...(getReferenceExpressions(alternate, context) ?? [alternate]),
    ];
  }
  if (expression.type === "LogicalExpression") {
    const { left, right } = expression;
    return [
      ...(getReferenceExpressions(left, context) ?? [left]),
      ...(getReferenceExpressions(right, context) ?? [right]),
    ];
  }
  if (expression.type !== "Identifier") {
    return [expression];
  }
  if (!withinTemplate(expression, context)) {
    return [expression];
  }
  const vueComponent = getVueComponentContext(context);
  if (!vueComponent) {
    return null;
  }
  // Identify expression references from Vue's `data` and `computed`.
  const props = vueComponent.findVueComponentProperty(expression.name);
  if (props == null) {
    // Property not found.
    return null;
  }
  return props;
}

/**
 * Checks whether the given node within `<template>`
 */
function withinTemplate(expr: AST.ESLintIdentifier, context: RuleContext) {
  const templateBody = context.getSourceCode().ast.templateBody;
  const templateRange = templateBody?.range ?? [0, 0];
  return templateRange[0] <= expr.range[0] && expr.range[1] <= templateRange[1];
}
