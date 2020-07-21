import { AST } from "vue-eslint-parser"
import type { ASTNode, RuleContext } from "../../../types"
import { unwrapTypesExpression } from "../../utils/nodes"

const traverseNodes = AST.traverseNodes

/**
 * If the given node is a Vue component, returns an Object that defines the Vue component.
 * @param node Node to check
 */
function getVueComponentObject(
    node: ASTNode,
): AST.ESLintObjectExpression | null {
    if (node.type !== "ExportDefaultDeclaration") {
        return null
    }
    const declaration = unwrapTypesExpression(node.declaration)
    if (declaration.type === "ObjectExpression") {
        return declaration
    }
    if (declaration.type === "CallExpression") {
        const callee = declaration.callee

        if (callee.type === "MemberExpression") {
            const calleeObject = unwrapTypesExpression(callee.object)

            if (
                calleeObject.type === "Identifier" &&
                calleeObject.name === "Vue" &&
                callee.property.type === "Identifier" &&
                callee.property.name === "extend" &&
                declaration.arguments.length >= 1
            ) {
                const object = unwrapTypesExpression(declaration.arguments[0])
                if (object.type === "ObjectExpression") {
                    return object
                }
            }
        }
    }
    return null
}

/**
 * Find Vue component of the current file.
 * @param {RuleContext} context The ESLint rule context object.
 * @returns {ASTNode|null} Vue component
 */
function findVueComponent(
    context: RuleContext,
): AST.ESLintObjectExpression | null {
    const sourceCode = context.getSourceCode()
    const componentComments = sourceCode
        .getAllComments()
        .filter((comment) => /@vue\/component/gu.test(comment.value))
    const foundNodes: ASTNode[] = []

    /**
     * Checks whether the given node is duplicate.
     * @param {object} node the node to check
     * @returns {boolean} `true` if the given node is duplicate.
     */
    function isDuplicateNode(node: ASTNode) {
        if (
            foundNodes.some((el) => el.loc.start.line === node.loc.start.line)
        ) {
            return true
        }
        foundNodes.push(node)
        return false
    }

    let result:
        | AST.ESLintObjectExpression
        | AST.ESLintDeclaration
        | AST.ESLintSpreadElement
        | null = null
    let breakNode = false
    traverseNodes(sourceCode.ast, {
        visitorKeys: sourceCode.visitorKeys,
        enterNode(node) {
            if (breakNode) {
                return
            }
            if (node.type === "ObjectExpression") {
                if (
                    !componentComments.some(
                        (el) => el.loc.end.line === node.loc.start.line - 1,
                    ) ||
                    isDuplicateNode(node)
                ) {
                    return
                }
                result = node
            } else if (node.type === "ExportDefaultDeclaration") {
                // export default {} in .vue
                const vueNode = getVueComponentObject(node)
                if (!vueNode || isDuplicateNode(vueNode)) {
                    return
                }
                result = vueNode
                breakNode = Boolean(node)
            }
        },
        leaveNode() {
            // noop
        },
    })
    return result
}

export default findVueComponent
