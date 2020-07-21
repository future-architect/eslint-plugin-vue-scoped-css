import { AST as vueAST } from "vue-eslint-parser"

import findVueComponent from "./find-vue"
import type { RuleContext, ASTNode, AST } from "../../../types"
import type { Template } from "../../template"
import { isDefined } from "../../../utils/utils"

const traverseNodes = vueAST.traverseNodes

const UNKNOWN = Symbol("unknown")

type DataPropertyNode = AST.ESLintExpression | AST.ESLintPattern
type ComputedPropertyNode = AST.ESLintExpression | AST.ESLintPattern
type Properties = {
    data:
        | {
              [key: string]: DataPropertyNode[]
              [UNKNOWN]?: true
          }
        | typeof UNKNOWN
    computed:
        | {
              [key: string]: ComputedPropertyNode[]
              [UNKNOWN]?: true
          }
        | typeof UNKNOWN
    [UNKNOWN]?: boolean
}

export class VueComponentContext {
    private readonly node: AST.ESLintObjectExpression
    private readonly context: RuleContext
    private properties: Properties | null = null
    public constructor(node: AST.ESLintObjectExpression, context: RuleContext) {
        this.node = node
        this.context = context
    }

    /**
     * Find property and get property value nodes, of Vue component.
     * @param {string} name property name
     * @returns {ASTNode[]} the Vue component property value nodes
     */
    public findVueComponentProperty(
        name: string,
    ):
        | (
              | AST.ESLintBlockStatement
              | AST.ESLintExpression
              | AST.ESLintPattern
          )[]
        | null {
        const properties =
            this.properties ||
            (this.properties = extractVueComponentPropertes(
                this.node,
                this.context,
            ))

        if (properties[UNKNOWN]) {
            return null
        }
        if (properties.data === UNKNOWN || properties.data[UNKNOWN]) {
            return null
        }
        if (properties.computed === UNKNOWN || properties.computed[UNKNOWN]) {
            return null
        }
        if (properties.data[name]) {
            return properties.data[name]
        }
        if (properties.computed[name]) {
            return properties.computed[name]
        }
        return null
    }

    /**
     * Get the classes operated by `classList`.
     * @param {string[] | null} refNames `ref` names
     * @param {boolean} isRoot give `true` if the element to be checked is a root.
     * @returns {(AST.ESLintExpression | AST.ESLintSpreadElement)[]} classes nodes
     */
    public getClassesOperatedByClassList(
        refNames: Template[] | null,
        isRoot: boolean,
    ): (AST.ESLintExpression | AST.ESLintSpreadElement)[] {
        return getClassesOperatedByClassList(
            this.node,
            refNames,
            isRoot,
            this.context,
        )
    }
}

/**
 * Create the Vue component context
 * @param {RuleContext} context ESLint rule context
 * @returns the component context
 */
export function createVueComponentContext(
    context: RuleContext,
): VueComponentContext | null {
    const node = findVueComponent(context)
    if (!node) {
        return null
    }
    return new VueComponentContext(node, context)
}

/**
 *  Extract properties and properties value nodes, of Vue component.
 */
function extractVueComponentPropertes(
    vueNode: AST.ESLintObjectExpression,
    context: RuleContext,
): Properties {
    const result: Properties = {
        data: {},
        computed: {},
    }
    for (const p of vueNode.properties) {
        if (p.type !== "Property") {
            result[UNKNOWN] = true
            continue
        }
        const keyName = getPropertyOrIdentifierName(p)
        if (keyName === "data") {
            result.data = extractVueComponentData(p.value, context)
        } else if (keyName === "computed") {
            result.computed = extractVueComponentComputed(p.value, context)
        }
    }
    return result
}

/**
 *  Extract data, of Vue component.
 */
function extractVueComponentData(
    dataNode: AST.ESLintExpression | AST.ESLintPattern,
    context: RuleContext,
):
    | {
          [key: string]: DataPropertyNode[]
          [UNKNOWN]?: true
      }
    | typeof UNKNOWN {
    const dataNodes: (AST.ESLintBlockStatement | AST.ESLintExpression)[] = []
    if (
        (dataNode.type === "ArrowFunctionExpression" &&
            dataNode.body.type === "BlockStatement") ||
        dataNode.type === "FunctionExpression"
    ) {
        // `data: () => { return ...}
        // `data() { return ...}
        // `data: function () { return ...}
        for (const returnStatement of getReturnStatements(
            dataNode.body,
            context,
        )) {
            if (returnStatement.argument) {
                dataNodes.push(returnStatement.argument)
            }
        }
    } else if (
        dataNode.type === "ArrowFunctionExpression" &&
        dataNode.body.type !== "BlockStatement"
    ) {
        // `data: () => ({...})
        dataNodes.push(dataNode.body)
    } else if (dataNode.type === "ObjectExpression") {
        // `data: {...}
        dataNodes.push(dataNode)
    } else {
        // unknown `data`
        return UNKNOWN
    }
    const data: {
        [key: string]: DataPropertyNode[]
        [UNKNOWN]?: true
    } = {}
    for (const dataObj of dataNodes) {
        if (dataObj.type !== "ObjectExpression") {
            // unknown `data`
            data[UNKNOWN] = true
            continue
        }
        for (const prop of dataObj.properties) {
            if (prop.type === "Property") {
                const keyName = getPropertyOrIdentifierName(prop)
                if (keyName == null) {
                    // Can not identify the key name.
                    data[UNKNOWN] = true
                } else {
                    const values = data[keyName] || (data[keyName] = [])
                    values.push(prop.value)
                }
            } else {
                // Can not identify the key name.
                data[UNKNOWN] = true
            }
        }
    }
    return data
}

/**
 *  Extract computed properties, of Vue component.
 */
function extractVueComponentComputed(
    computedNode: AST.ESLintExpression | AST.ESLintPattern,
    context: RuleContext,
):
    | {
          [key: string]: ComputedPropertyNode[]
          [UNKNOWN]?: true
      }
    | typeof UNKNOWN {
    if (computedNode.type !== "ObjectExpression") {
        // Can not identify the key name.
        return UNKNOWN
    }

    const computed: {
        [key: string]: ComputedPropertyNode[]
        [UNKNOWN]?: true
    } = {}
    for (const p of computedNode.properties) {
        if (p.type !== "Property") {
            // Can not identify the key name.
            computed[UNKNOWN] = true
            continue
        }
        const keyName = getPropertyOrIdentifierName(p)
        if (!keyName) {
            // Can not identify the key name.
            computed[UNKNOWN] = true
            continue
        }
        const values = computed[keyName] || (computed[keyName] = [])
        const { value } = p
        let func: AST.ESLintExpression | AST.ESLintPattern = value

        if (value.type === "ObjectExpression") {
            const get = value.properties
                .filter(isProperty)
                .find((prop) => getPropertyOrIdentifierName(prop) === "get")
            if (get) {
                func = get.value
            }
        }
        if (
            (func.type === "ArrowFunctionExpression" &&
                func.body.type === "BlockStatement") ||
            func.type === "FunctionExpression"
        ) {
            // `prop: () => { return ...}
            // `prop() { return ...}
            // `prop: function () { return ...}
            const exprs = getReturnStatements(func.body, context)
                .map((r) => r.argument)
                .filter(isDefined)
            values.push(...exprs)
        } else if (
            func.type === "ArrowFunctionExpression" &&
            func.body.type !== "BlockStatement"
        ) {
            // `prop: () => ({...})
            values.push(func.body as any)
        } else {
            // Unknown computed property.
            computed[UNKNOWN] = true
        }
    }
    return computed
}

/**
 * Get the classes operated by `classList`.
 * @param {ObjectExpression} vueNode VueComponent node
 * @param {string[] | null} refNames `ref` names
 * @param {boolean} isRoot give `true` if the element to be checked is a root.
 * @returns {string[]} classes
 */
function getClassesOperatedByClassList(
    vueNode: AST.ESLintObjectExpression,
    refNames: Template[] | null,
    isRoot: boolean,
    context: RuleContext,
): (AST.ESLintExpression | AST.ESLintSpreadElement)[] {
    const results: (AST.ESLintExpression | AST.ESLintSpreadElement)[] = []
    traverseNodes(vueNode, {
        visitorKeys: context.getSourceCode().visitorKeys,
        enterNode(node) {
            if (
                node.type !== "CallExpression" ||
                node.callee.type !== "MemberExpression"
            ) {
                return
            }
            const o = node.callee.object
            if (getPropertyOrIdentifierName(o) !== "classList") {
                return
            }

            if (
                o.type === "MemberExpression" &&
                getPropertyOrIdentifierName(o.object) === "$el"
            ) {
                // `class` operations are performed on the root element.
                if (!isRoot) {
                    // If it is not the root element, it will not match.
                    return
                }
            }
            if (refNames != null) {
                const $refName =
                    o.type === "MemberExpression" && o.object.type !== "Super"
                        ? get$RefName(o.object)
                        : null

                if ($refName != null) {
                    if (!refNames.some((r) => r.matchString($refName))) {
                        // The ref name can be identified.
                        // It is also clear that there is no match.
                        return
                    }
                }
            }

            const argumentNodes = getClassesArguments(node)

            results.push(...argumentNodes)
        },
        leaveNode() {
            // noop
        },
    })
    return results
}

/**
 * Gets the Return statements from given body
 */
function getReturnStatements(
    body: AST.ESLintBlockStatement,
    context: RuleContext,
): AST.ESLintReturnStatement[] {
    const returnStatements: AST.ESLintReturnStatement[] = []
    const skipNodes: (
        | AST.ESLintArrowFunctionExpression
        | AST.ESLintFunctionExpression
        | AST.ESLintFunctionDeclaration
    )[] = []
    traverseNodes(body, {
        visitorKeys: context.getSourceCode().visitorKeys,
        enterNode(node) {
            if (skipNodes.length) {
                return
            }
            if (
                node.type === "ArrowFunctionExpression" ||
                node.type === "FunctionExpression" ||
                node.type === "FunctionDeclaration"
            ) {
                skipNodes.unshift(node)
            } else if (node.type === "ReturnStatement") {
                returnStatements.push(node)
            }
        },
        leaveNode(node) {
            if (skipNodes[0] === node) {
                skipNodes.shift()
            }
        },
    })
    return returnStatements
}

/**
 * Gets the property or identifier name from given node
 */
function getPropertyOrIdentifierName(node: ASTNode): string | null {
    if (node.type === "Identifier") {
        return node.name
    } else if (node.type === "MemberExpression") {
        if (node.property.type === "Identifier" && !node.computed) {
            // `o.a` / not `o[a]`
            return node.property.name
        } else if (node.property.type === "Literal" && node.computed) {
            // `o['a']`
            return getLiteralString(node.property)
        }
    } else if (node.type === "Property") {
        if (node.key.type === "Identifier" && !node.computed) {
            // `{ a: ... }` / not `{ [a]: ... }`
            return node.key.name
        } else if (node.key.type === "Literal") {
            // `{ 'a': ... }` or `{ ['a']: ... }`
            return getLiteralString(node.key)
        }
    }
    return null
}

/**
 * Gets the ref name from given expression
 */
function get$RefName(expr: AST.ESLintExpression): string | null {
    if (expr.type !== "MemberExpression") {
        return null
    }

    // Check if it belongs to `$refs`.
    const { object } = expr
    const name = getPropertyOrIdentifierName(object)
    if (name !== "$refs") {
        return null
    }
    // get the `ref` name
    return getPropertyOrIdentifierName(expr)
}

/**
 * Get the class name arguments for the given node.
 */
function getClassesArguments(
    node: AST.ESLintCallExpression,
): (AST.ESLintExpression | AST.ESLintSpreadElement)[] {
    const methodName = getPropertyOrIdentifierName(node.callee)
    if (methodName === "add" || methodName === "remove") {
        return node.arguments
    } else if (methodName === "toggle" || methodName === "contains") {
        return [node.arguments[0]]
    } else if (methodName === "replace") {
        return [node.arguments[0], node.arguments[1]]
    }
    return []
}

/**
 * Get the string from given Literal
 */
function getLiteralString(node: AST.ESLintLiteral): string {
    if (typeof node.value === "string") {
        return node.value
    }
    return `${node.value}`
}

/**
 * Checks whether the given node is Property
 * @param node node to check
 */
function isProperty(
    node:
        | AST.ESLintProperty
        | AST.ESLintSpreadElement
        | AST.ESLintLegacySpreadProperty,
): node is AST.ESLintProperty {
    return node.type === "Property"
}
