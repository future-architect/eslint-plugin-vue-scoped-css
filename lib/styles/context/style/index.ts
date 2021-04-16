import { parse } from "../../parser"
import type {
    AST,
    SourceCode,
    RuleContext,
    LineAndColumnData,
} from "../../../types"
import type { VCSSStyleSheet, VCSSNode, VCSSSelectorNode } from "../../ast"
import { isVCSSContainerNode, hasSelectorNodes } from "../../utils/css-nodes"

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
        /* istanbul ignore if */
        if (!context.parserServices.getDocumentFragment) {
            return null
        }
        const df = context.parserServices.getDocumentFragment()
        inDocumentFragment = true
        errors = df?.errors
        /* istanbul ignore if */
        if (errors == null) {
            return null
        }
    }
    const error =
        errors.find(
            (err) =>
                typeof err.code === "string" &&
                err.code.startsWith("eof-") &&
                style.range[0] <= err.index &&
                err.index < style.range[1],
        ) ||
        errors.find(
            (err) =>
                typeof err.code === "string" && err.code.startsWith("eof-"),
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
        /* istanbul ignore if */
        if (templateBody) {
            document = templateBody.parent as AST.VDocumentFragment
        }
    }
    if (document) {
        return document.children
            .filter(isVElement)
            .filter((element) => element.name === "style")
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
    return startTag.attributes.some((attr) => attr.key.name === "scoped")
}

/**
 * Check whether `module` attribute is given to `<style>` node.
 * @param {VElement} style `<style>` node to check.
 * @returns {boolean} `true` if it has invalid EOF.
 */
function isCssModule(style: AST.VElement): boolean {
    const { startTag } = style
    return startTag.attributes.some((attr) => attr.key.name === "module")
}

/**
 * Get the language of `<style>`
 * @param {VElement} style `<style>` node
 * @returns {string} the language of `<style>`
 */
function getLang(style: AST.VElement) {
    const { startTag } = style
    const lang =
        startTag.attributes.find((attr) => attr.key.name === "lang") || null
    return (
        lang?.type === "VAttribute" &&
        lang.value?.type === "VLiteral" &&
        lang.value.value
    )
}

interface VisitorVCSSNode {
    exit?: boolean
    break?: boolean
    enterNode(node: VCSSNode): void
    leaveNode?(node: VCSSNode): void
}
interface VisitorVCSSSelectorNode {
    exit?: boolean
    break?: boolean
    enterNode(node: VCSSSelectorNode): void
    leaveNode?(node: VCSSSelectorNode): void
}

interface BaseStyleContext {
    readonly styleElement: AST.VElement
    readonly sourceCode: SourceCode
    readonly scoped: boolean
    readonly module: boolean
    readonly lang: string
    traverseNodes(visitor: VisitorVCSSNode): void
    traverseSelectorNodes(visitor: VisitorVCSSSelectorNode): void
}

export interface ValidStyleContext extends BaseStyleContext {
    readonly invalid: null
    readonly cssNode: VCSSStyleSheet
}
export interface InvalidStyleContext extends BaseStyleContext {
    readonly invalid: {
        message: string
        needReport: boolean
        loc: LineAndColumnData
    }
    readonly cssNode: null
}

export type StyleContext = InvalidStyleContext | ValidStyleContext
/**
 * Checks whether the given context is valid
 */
export function isValidStyleContext(
    context: StyleContext,
): context is ValidStyleContext {
    return !context.invalid
}

/**
 * Style context
 */
export class StyleContextImpl {
    public readonly styleElement: AST.VElement

    public readonly sourceCode: SourceCode

    public readonly invalid: {
        message: string
        needReport: boolean
        loc: LineAndColumnData
    } | null

    public readonly scoped: boolean

    public readonly module: boolean

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
        } else if (endTag == null && !startTag.selfClosing) {
            this.invalid = {
                message: "Missing end tag",
                needReport: true,
                loc: startTag.loc.end,
            }
        }

        this.scoped = Boolean(style && isScoped(style))
        this.module = Boolean(style && isCssModule(style))

        this.lang = ((style && getLang(style)) || "css").toLowerCase()

        if (!this.invalid) {
            this.cssText = endTag
                ? sourceCode.text.slice(startTag.range[1], endTag.range[0])
                : ""
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

    public traverseNodes(visitor: VisitorVCSSNode): void {
        if (this.cssNode) {
            traverseNodes(this.cssNode, visitor)
        }
    }

    public traverseSelectorNodes(visitor: VisitorVCSSSelectorNode): void {
        this.traverseNodes({
            enterNode(node) {
                if (hasSelectorNodes(node)) {
                    for (const sel of node.selectors) {
                        traverseSelectorNodes(sel, visitor)
                    }
                }
            },
        })
    }
}

/**
 * Traverse the given node.
 * @param node The node to traverse.
 * @param visitor The node visitor.
 */
function traverseNodes(node: VCSSNode, visitor: VisitorVCSSNode): void {
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

    visitor.leaveNode?.(node)
}

/**
 * Traverse the given node.
 * @param node The node to traverse.
 * @param visitor The node visitor.
 */
function traverseSelectorNodes(
    node: VCSSSelectorNode,
    visitor: VisitorVCSSSelectorNode,
): void {
    visitor.break = false
    visitor.enterNode(node)
    if (visitor.exit || visitor.break) {
        return
    }

    if (node.type === "VCSSSelector" || node.type === "VCSSSelectorPseudo") {
        for (const child of node.nodes) {
            traverseSelectorNodes(child, visitor)
            if (visitor.break) {
                break
            }
            if (visitor.exit) {
                return
            }
        }
    }

    visitor.leaveNode?.(node)
}

/**
 * Create the style contexts
 * @param {RuleContext} context ESLint rule context
 * @returns {StyleContext[]} the style contexts
 */
export function createStyleContexts(context: RuleContext): StyleContext[] {
    const styles = getStyleElements(context)

    return styles.map(
        (style) => new StyleContextImpl(style, context) as StyleContext,
    )
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
