import type { RuleContext } from "../types"

/**
 * Checks whether the given context has template block
 */
export function hasTemplateBlock(context: RuleContext): boolean {
    const sourceCode = context.getSourceCode()
    const { ast } = sourceCode
    return Boolean(ast.templateBody)
}

/**
 * Checks whether the given node has defined
 */
export function isDefined<T>(item: T | null | undefined): item is T {
    return item !== null && item !== undefined
}
