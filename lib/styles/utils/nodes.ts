import {
    AST,
    VDirectiveKeyV6,
    VDirectiveKey,
    TSAsExpression,
    RuleContext,
} from "../../types"
import eslintUtils from "eslint-utils"
// eslint-disable-next-line @mysticatea/node/no-extraneous-import
import { ScopeManager, Scope } from "eslint-scope"

/**
 * Checks whether the given node is VDirectiveKey in vue-eslint-parser@6
 * @param node node to check
 */
export function isVDirectiveKeyV6(
    node: VDirectiveKey,
): node is VDirectiveKeyV6 {
    return typeof node.name !== "string"
}

/**
 * Checks whether the given node is VDirective
 * @param node node to check
 */
export function isVDirective(
    node: AST.VAttribute | AST.VDirective,
): node is AST.VDirective {
    return node.type === "VAttribute" && node.directive
}

/**
 * Unwrap typescript types like "X as F"
 * @param {ASTNode} node
 * @return {ASTNode}
 */
export function unwrapTypesExpression<
    T extends
        | AST.ESLintExpression
        | AST.ESLintSuper
        | AST.ESLintDeclaration
        | AST.ESLintSpreadElement
        | TSAsExpression
>(node: T): T {
    return node?.type === "TSAsExpression"
        ? ((node as TSAsExpression).expression as any)
        : node
}

/**
 * Gets the string from given node
 */
export function getStringFromNode(
    node: AST.ESLintExpression,
    context: RuleContext,
): string | null {
    const evaluated = eslintUtils.getStaticValue(
        node,
        getScope(context.getSourceCode().scopeManager, node),
    )
    if (evaluated && typeof evaluated.value === "string") {
        return evaluated.value
    }
    return null
}

/**
 * Gets the scope for the current node
 * @param {ScopeManager} scopeManager The scope manager for this AST
 * @param {ASTNode} currentNode The node to get the scope of
 * @returns {eslint-scope.Scope} The scope information for this node
 */
function getScope(
    scopeManager: ScopeManager,
    currentNode: AST.ESLintNode,
): Scope {
    // On Program node, get the outermost scope to avoid return Node.js special function scope or ES modules scope.
    const inner = currentNode.type !== "Program"

    for (
        let node: AST.ESLintNode | null | undefined = currentNode;
        node;
        node = node.parent as AST.ESLintNode
    ) {
        const scope = scopeManager.acquire(node as any, inner)

        if (scope) {
            if (scope.type === "function-expression-name") {
                return scope.childScopes[0]
            }
            return scope
        }
    }

    return scopeManager.scopes[0]
}
