import { parse } from "../../parser"
import { AST, SourceCode, RuleContext, LineAndColumnData } from "../../../types"
import { VCSSStyleSheet, VCSSNode } from "../../ast"
import { isVCSSContainerNode } from "../../utils/css-nodes"

/**
 * Check whether the program has invalid EOF or not.
 */
function getInvalidEOFError(
    context: RuleContext,
    style: AST.VElement,
): {
    inDocumentFragment: boolean
    error: AST.ParseError
} | null {
    const node = context.getSourceCode().ast
    const body = node.templateBody
    let errors = body?.errors
    let inDocumentFragment = false
    if (errors == null) {
        if (!context.parserServices.getDocumentFragment) {
            return null
        }
        const df = context.parserServices.getDocumentFragment()
        inDocumentFragment = true
        errors = df?.errors
        if (errors == null) {
            return null
        }
    }
    const error =
        errors.find(
            err =>
                typeof err.code === "string" &&
                err.code.startsWith("eof-") &&
                style.range[0] <= err.index &&
                err.index < style.range[1],
        ) ||
        errors.find(
            err => typeof err.code === "string" && err.code.startsWith("eof-"),
        )
    if (!error) {
        return null
    }
    return {
        error,
        inDocumentFragment,
    }
}

/**
 * Get the array of `<style>` nodes.
 * @param {Program} node the program node
 * @returns {VElement[]} the array of `<style>` nodes.
 */
function getStyleElements(context: RuleContext): AST.VElement[] {
    let document: AST.VDocumentFragment | null = null
    if (context.parserServices.getDocumentFragment) {
        // vue-eslint-parser v7.0.0
        document = context.parserServices.getDocumentFragment()
    } else {
        const sourceCode = context.getSourceCode()
        const { ast } = sourceCode
        const templateBody = ast.templateBody as AST.ESLintProgram | undefined
        if (templateBody) {
            document = templateBody.parent as AST.VDocumentFragment
        }
    }
    if (document) {
        return document.children
            .filter(isVElement)
            .filter(element => element.name === "style")
    }
    return []
}

/**
 * Check whether `scoped` attribute is given to `<style>` node.
 * @param {VElement} style `<style>` node to check.
 * @returns {boolean} `true` if it has invalid EOF.
 */
function isScoped(style: AST.VElement): boolean {
    const { startTag } = style
    return startTag.attributes.some(attr => attr.key.name === "scoped")
}

/**
 * Get the language of `<style>`
 * @param {VElement} style `<style>` node
 * @returns {string} the language of `<style>`
 */
function getLang(style: AST.VElement) {
    const { startTag } = style
    const lang =
        startTag.attributes.find(attr => attr.key.name === "lang") || null
    return (
        lang?.type === "VAttribute" &&
        lang.value?.type === "VLiteral" &&
        lang.value.value
    )
}

interface Visitor {
    exit?: boolean
    break?: boolean
    enterNode(node: VCSSNode): void
    leaveNode(node: VCSSNode): void
}

/**
 * Style context
 */
export class StyleContext {
    public readonly styleElement: AST.VElement
    public readonly sourceCode: SourceCode
    public readonly invalid: {
        message: string
        needReport: boolean
        loc: LineAndColumnData
    } | null
    public readonly scoped: boolean
    public readonly lang: string
    private readonly cssText: string | null
    public readonly cssNode: VCSSStyleSheet | null
    public constructor(style: AST.VElement, context: RuleContext) {
        const sourceCode = context.getSourceCode()
        this.styleElement = style
        this.sourceCode = sourceCode

        const { startTag, endTag } = style
        this.invalid = null
        const eof = getInvalidEOFError(context, style)
        if (eof) {
            this.invalid = {
                message: eof.error.message,
                needReport: eof.inDocumentFragment,
                loc: { line: eof.error.lineNumber, column: eof.error.column },
            }
        } else if (endTag == null) {
            this.invalid = {
                message: "Missing end tag",
                needReport: true,
                loc: startTag.loc.end,
            }
        }

        this.scoped = Boolean(style && isScoped(style))

        this.lang = ((style && getLang(style)) || "css").toLowerCase()

        if (!this.invalid && endTag != null) {
            this.cssText = sourceCode.text.slice(
                startTag.range[1],
                endTag.range[0],
            )
            this.cssNode = parse(
                sourceCode,
                startTag.loc.end,
                this.cssText,
                this.lang,
            )
        } else {
            this.cssText = null
            this.cssNode = null
        }
    }

    public traverseNodes(visitor: Visitor): void {
        if (this.cssNode) {
            traverseNodes(this.cssNode, visitor)
        }
    }
}

/**
 * Traverse the given node.
 * @param node The node to traverse.
 * @param visitor The node visitor.
 */
function traverseNodes(node: VCSSNode, visitor: Visitor): void {
    visitor.break = false
    visitor.enterNode(node)
    if (visitor.exit || visitor.break) {
        return
    }

    if (isVCSSContainerNode(node)) {
        for (const child of node.nodes) {
            traverseNodes(child, visitor)
            if (visitor.break) {
                break
            }
            if (visitor.exit) {
                return
            }
        }
    }

    visitor.leaveNode(node)
}

/**
 * Create the style contexts
 * @param {RuleContext} context ESLint rule context
 * @returns {StyleContext[]} the style contexts
 */
export function createStyleContexts(context: RuleContext): StyleContext[] {
    const styles = getStyleElements(context)

    return styles.map(style => new StyleContext(style, context))
}

/**
 * Checks whether the given node is VElement
 * @param node node to check
 */
function isVElement(
    node: AST.VElement | AST.VText | AST.VExpressionContainer,
): node is AST.VElement {
    return node?.type === "VElement"
}
