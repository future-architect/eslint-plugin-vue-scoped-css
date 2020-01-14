import { RuleContext } from "../types"

/**
 * Checks whether the given context has template block
 */
export function hasTemplateBlock(context: RuleContext): boolean {
    const sourceCode = context.getSourceCode()
    const { ast } = sourceCode
    return Boolean(ast.templateBody)
}
