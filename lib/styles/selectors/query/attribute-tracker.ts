import { getVueComponentContext } from "../../context"
import type { RuleContext, AST } from "../../../types"
import { isVDirective, isVBind, getArgument } from "../../../utils/templates"

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
    const results: AttributeValueExpressions[] = []
    const { startTag } = element
    for (const attr of startTag.attributes) {
        if (!isVDirective(attr)) {
            const { key, value } = attr
            if (value == null) {
                continue
            }
            if (key.name === name) {
                results.push(value)
            }
        } else {
            const { key, value } = attr
            if (value == null) {
                continue
            }
            if (!isVBind(key)) {
                continue
            }
            const bindArg = getArgument(key)
            if (bindArg == null) {
                // bind name is unknown.
                return null
            }
            if (bindArg !== name) {
                continue
            }
            const { expression } = value
            if (expression == null) {
                // empty or syntax error
                continue
            }
            const expressions = getReferenceExpressions(expression, context)
            if (!expressions) {
                // Expressions not found.
                return null
            }
            for (const e of expressions) {
                results.push(e)
            }
        }
    }
    return results
}

/**
 * Gets the reference expressions to the given expression.
 * @param {ASTNode} expression expression to track
 * @param {RuleContext} context ESLint rule context
 * @returns {ASTNode[]} reference expressions.
 */
export function getReferenceExpressions(
    expression: AttrExpressions,
    context: RuleContext,
): ReferenceExpressions[] | null {
    if (expression.type !== "Identifier") {
        return [expression]
    }
    const vueComponent = getVueComponentContext(context)
    if (!vueComponent) {
        return null
    }
    // Identify expression references from Vue's `data` and `computed`.
    const props = vueComponent.findVueComponentProperty(expression.name)
    if (props == null) {
        // Property not found.
        return null
    }
    return props
}

export type ReferenceExpressions =
    | AST.ESLintBlockStatement
    | AST.ESLintExpression
    | AST.ESLintPattern
    | AttrExpressions

type AttrExpressions =
    | AST.ESLintExpression
    | AST.VFilterSequenceExpression
    | AST.VForExpression
    | AST.VOnExpression
    | AST.VSlotScopeExpression

export type AttributeValueExpressions = ReferenceExpressions | AST.VLiteral
