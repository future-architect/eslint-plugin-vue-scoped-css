import { getVueComponentContext } from "../../context"
import { RuleContext, AST, VDirectiveKey } from "../../../types"
import { isVDirectiveKeyV6, isVDirective } from "../../utils/nodes"

/**
 * Checks if the given key is a `v-bind` directive.
 * @param {VDirectiveKey} key directive key to check
 * @returns {boolean} `true` if the given key is a `v-bind` directive.
 */
function isVBind(key: VDirectiveKey) {
    if (isVDirectiveKeyV6(key)) {
        if (key.name.name !== "bind") {
            return false
        }
        return true
    }
    if (
        // vue-eslint-parser@<6.0.0
        key.name !== "bind"
    ) {
        return false
    }
    return true
}

/**
 * Get the directive argument of the given key.
 * @param {VDirectiveKey} key directive key
 * @returns {string|null} the directive argument of the given key. `null` if the directive argument is unknown.
 */
function getArgument(key: VDirectiveKey) {
    if (isVDirectiveKeyV6(key)) {
        const argument = key.argument
        if (argument == null) {
            // `v-bind="..."` can not identify names.
            return null
        }
        if (argument.type === "VExpressionContainer") {
            // Dynamic arguments can not identify names.
            return null
        }
        if (argument.type === "VIdentifier") {
            return argument.name
        }
        return null
    }
    const argument = key.argument
    if (argument == null) {
        // `v-bind="..."` can not identify names.
        return null
    }
    // vue-eslint-parser@<6.0.0
    if (/^\[.*\]$/u.test(argument)) {
        // Dynamic arguments?
        return null
    }
    return argument || ""
}

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
