import type { AST, RuleContext, VDirectiveKey, VDirectiveKeyV6 } from "../types"

/**
 * Get VElements
 */
export function getElements(
    context: RuleContext,
    predicate: (element: AST.VElement) => boolean,
): AST.VElement[] {
    const node = context.getSourceCode().ast
    const body = node.templateBody
    if (!body) {
        return []
    }
    return [...iterate(body)]

    /**
     * Iterate
     */
    function* iterate(element: AST.VElement): IterableIterator<AST.VElement> {
        if (predicate(element)) {
            yield element
        }

        for (const child of element.children) {
            if (isVElement(child)) {
                yield* iterate(child)
            }
        }
    }
}

/**
 * Checks whether the given node is VElement
 * @param node node to check
 */
export function isVElement(
    node: AST.VElement | AST.VText | AST.VExpressionContainer,
): node is AST.VElement {
    return node?.type === "VElement"
}

/**
 * Checks whether the given element is the `<transition>` element.
 * @param {VElement} element the element to check
 * @returns {boolean} `true` if the given element is the `<transition>` element.
 */
export function isTransitionElement(
    element: AST.VElement | AST.VDocumentFragment,
): boolean {
    return (
        element.type === "VElement" &&
        (element.name === "transition" || element.rawName === "Transition")
    )
}

/**
 * Checks whether the given element is the `<transition-group>` element.
 * @param {VElement} element the element to check
 * @returns {boolean} `true` if the given element is the `<transition-group>` element.
 */
export function isTransitionGroupElement(
    element: AST.VElement | AST.VDocumentFragment,
): boolean {
    return (
        element.type === "VElement" &&
        (element.name === "transition-group" ||
            element.rawName === "TransitionGroup")
    )
}

/**
 * Find attribute from given node
 */
export function findAttribute(
    node: AST.VElement | AST.VStartTag,
    name: string,
): AST.VAttribute | AST.VDirective | null {
    if (node.type === "VElement") {
        return findAttribute(node.startTag, name)
    }
    return (
        node.attributes.find((attr): attr is
            | AST.VAttribute
            | AST.VDirective => {
            if (isVDirective(attr)) {
                if (isVBind(attr.key)) {
                    return getArgument(attr.key) === name
                }
            } else {
                return attr.key.name === name
            }
            return false
        }) || null
    )
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
 * Checks if the given key is a `v-bind` directive.
 * @param {VDirectiveKey} key directive key to check
 * @returns {boolean} `true` if the given key is a `v-bind` directive.
 */
export function isVBind(key: VDirectiveKey): boolean {
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
export function getArgument(key: VDirectiveKey): string | null {
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
 * Checks whether the given node is VDirectiveKey in vue-eslint-parser@6
 * @param node node to check
 */
export function isVDirectiveKeyV6(
    node: VDirectiveKey,
): node is VDirectiveKeyV6 {
    return typeof node.name !== "string"
}
