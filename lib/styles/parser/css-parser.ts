import postcss from "postcss"
import postcssSafeParser from "postcss-safe-parser"
import { CSSSelectorParser } from "./selector/css-selector-parser"
import {
    VCSSStyleSheet,
    VCSSStyleRule,
    VCSSDeclarationProperty,
    VCSSAtRule,
    VCSSComment,
    VCSSCommentNode,
    VCSSNode,
    VCSSContainerNode,
    VCSSParsingError,
    VCSSUnknown,
} from "../ast"
import type {
    SourceCode,
    LineAndColumnData,
    PostCSSNode,
    PostCSSRoot,
    SourceLocation,
    PostCSSLoc,
    PostCSSRule,
    PostCSSAtRule,
    PostCSSDeclaration,
    PostCSSComment,
} from "../../types"
import { isPostCSSContainer } from "./utils"
import { isVCSSContainerNode } from "../utils/css-nodes"
import { isDefined } from "../../utils/utils"

/**
 * CSS Parser
 */
export class CSSParser {
    protected readonly sourceCode: SourceCode
    protected commentContainer: VCSSCommentNode[]
    private _selectorParser: CSSSelectorParser | null = null
    private readonly lang: string
    private anyErrors: any[] = []
    /**
     * constructor.
     * @param {SourceCode} sourceCode the SourceCode object that you can use to work with the source that was passed to ESLint.
     */
    public constructor(sourceCode: SourceCode, lang: string) {
        this.sourceCode = sourceCode
        this.commentContainer = []
        this.lang = lang
    }

    /**
     * Parse the CSS.
     * @param {string} css the CSS to parse
     * @param {LineAndColumnData} offsetLocation start location of css.
     * @return {VCSSStyleSheet} parsed result
     */
    public parse(css: string, offsetLocation: LineAndColumnData) {
        const { sourceCode } = this

        this.commentContainer = []
        this._selectorParser = this.createSelectorParser()
        this.anyErrors = []

        try {
            const postcssRoot = this.parseInternal(css) as PostCSSRoot

            const rootNode = this._postcssNodeToASTNode(
                offsetLocation,
                postcssRoot,
            )
            rootNode.comments = this.commentContainer
            rootNode.errors.push(
                ...this.collectErrors(this.anyErrors, offsetLocation),
            )

            return rootNode
        } catch (e) {
            const startIndex = sourceCode.getIndexFromLoc(offsetLocation)
            const endIndex = startIndex + css.length
            const styleLoc = {
                start: offsetLocation,
                end: sourceCode.getLocFromIndex(endIndex),
            }
            return new VCSSStyleSheet(
                null as any,
                styleLoc,
                startIndex,
                endIndex,
                {
                    errors: this.collectErrors(
                        [...this.anyErrors, e],
                        offsetLocation,
                    ),
                    lang: this.lang,
                },
            )
        }
    }

    private addError(error: any) {
        this.anyErrors.push(error)
    }

    private collectErrors(
        errors: any[],
        offsetLocation: LineAndColumnData,
    ): VCSSParsingError[] {
        const errorNodes = []
        const duplicate = new Set<string>()
        for (const error of errors) {
            const errorLoc =
                error.line != null && error.column != null
                    ? getESLintLineAndColumnFromPostCSSPosition(
                          offsetLocation,
                          error,
                      )
                    : offsetLocation
            const message = error.reason || error.message

            const key = `[${errorLoc.line}:${errorLoc.column}]: ${message}`
            if (duplicate.has(key)) {
                continue
            }
            duplicate.add(key)
            const errorIndex = this.sourceCode.getIndexFromLoc(errorLoc)
            errorNodes.push(
                new VCSSParsingError(
                    null as any,
                    {
                        start: errorLoc,
                        end: errorLoc,
                    },
                    errorIndex,
                    errorIndex,
                    {
                        lang: this.lang,
                        message,
                    },
                ),
            )
        }
        return errorNodes
    }

    protected get selectorParser(): CSSSelectorParser {
        return (
            this._selectorParser ||
            (this._selectorParser = this.createSelectorParser())
        )
    }

    /**
     * Convert PostCSS node to node that can be handled by ESLint.
     * @param {LineAndColumnData} offsetLocation start location of css.
     * @param {object} node the PostCSS node to comvert
     * @param {Node?} parent parent node
     * @return {Node|null} converted node.
     */
    private _postcssNodeToASTNode(
        offsetLocation: LineAndColumnData,
        node: PostCSSRoot,
    ): VCSSStyleSheet
    private _postcssNodeToASTNode(
        offsetLocation: LineAndColumnData,
        node: PostCSSNode,
        parent: VCSSContainerNode,
    ): VCSSNode | null
    private _postcssNodeToASTNode(
        offsetLocation: LineAndColumnData,
        node: PostCSSNode,
        parent?: VCSSContainerNode,
    ): VCSSNode | null {
        const { sourceCode } = this
        const startLoc = getESLintLineAndColumnFromPostCSSNode(
            offsetLocation,
            node,
            "start",
        ) || { line: 0, column: 1 }
        const start = sourceCode.getIndexFromLoc(startLoc)
        const endLoc =
            getESLintLineAndColumnFromPostCSSNode(
                offsetLocation,
                node,
                "end",
            ) ||
            // for node type: `root`
            sourceCode.getLocFromIndex(
                sourceCode.getIndexFromLoc(offsetLocation) +
                    (node as PostCSSRoot).source.input.css.length,
            )
        const end = sourceCode.getIndexFromLoc(endLoc)
        const loc: SourceLocation = {
            start: startLoc,
            end: endLoc,
        }

        const astNode = this[typeToConvertMethodName(node.type)](
            node as any,
            loc,
            start,
            end,
            parent as any,
        )

        if (astNode == null) {
            return null
        }
        if (isPostCSSContainer(node) && isVCSSContainerNode(astNode)) {
            astNode.nodes = node.nodes
                .map((n) =>
                    this._postcssNodeToASTNode(offsetLocation, n, astNode),
                )
                .filter(isDefined)
        }
        return astNode
    }

    protected parseInternal(css: string): postcss.Root {
        try {
            return postcss.parse(css)
        } catch (e) {
            this.addError(e)
            return postcssSafeParser(css)
        }
    }

    /* eslint-disable class-methods-use-this */
    protected createSelectorParser(): CSSSelectorParser {
        return new CSSSelectorParser(this.sourceCode, this.commentContainer)
    }

    /**
     * Convert root Node
     * @param  {object} node  The node.
     * @param  {SourceLocation} loc  The location.
     * @param  {number} start  The index of start.
     * @param  {number} end  The index of end.
     * @param  {Node} parent  The parent node.
     * @returns {VCSSStyleSheet}
     */
    protected convertRootNode(
        node: PostCSSRoot,
        loc: SourceLocation,
        start: number,
        end: number,
    ): VCSSNode | null {
        return new VCSSStyleSheet(node, loc, start, end, { lang: this.lang })
    }

    /**
     * Convert rule Node
     * @param  {object} node  The node.
     * @param  {SourceLocation} loc  The location.
     * @param  {number} start  The index of start.
     * @param  {number} end  The index of end.
     * @param  {Node} parent  The parent node.
     * @returns {VCSSStyleRule}
     */
    protected convertRuleNode(
        node: PostCSSRule,
        loc: SourceLocation,
        start: number,
        end: number,
        parent: VCSSContainerNode,
    ): VCSSNode | null {
        const astNode = new VCSSStyleRule(node, loc, start, end, {
            parent,
            rawSelectorText: this.getRaw(node, "selector")?.raw ?? null,
        })
        astNode.selectors = this.selectorParser.parse(
            astNode.rawSelectorText,
            astNode.loc.start,
            astNode,
        )

        if (this.getRaw(node, "between")?.trim()) {
            this.parseRuleRawsBetween(node, astNode)
        }

        return astNode
    }

    protected parseRuleRawsBetween(node: PostCSSRule, astNode: VCSSNode) {
        const between = this.getRaw(node, "between")
        const rawSelector = this.getRaw(node, "selector")?.raw ?? node.selector
        const betweenStart = astNode.range[0] + rawSelector.length
        const postcssRoot = this.parseInternal(between || "") as PostCSSRoot

        this._postcssNodeToASTNode(
            this.sourceCode.getLocFromIndex(betweenStart),
            postcssRoot,
        )
    }

    /**
     * Convert atrule Node
     * @param  {object} node  The node.
     * @param  {SourceLocation} loc  The location.
     * @param  {number} start  The index of start.
     * @param  {number} end  The index of end.
     * @param  {Node} parent  The parent node.
     * @returns {VCSSAtRule}
     */
    protected convertAtruleNode(
        node: PostCSSAtRule,
        loc: SourceLocation,
        start: number,
        end: number,
        parent: VCSSContainerNode,
    ): VCSSNode | null {
        const astNode = new VCSSAtRule(node, loc, start, end, {
            parent,
            rawParamsText: this.getRaw(node, "params")?.raw ?? null,
            identifier: this.getRaw(node as any, "identifier") ?? "@",
        })
        if (node.name === "nest") {
            // The parameters following `@nest` are parsed as selectors.
            const paramsStartIndex =
                astNode.range[0] + // start index of at-rule
                astNode.identifier.length + // `@`
                astNode.name.length + // `nest`
                (this.getRaw(node, "afterName") || "").length // comments and spaces

            astNode.selectors = this.selectorParser.parse(
                astNode.rawParamsText,
                this.sourceCode.getLocFromIndex(paramsStartIndex),
                astNode,
            )
        }

        if (this.getRaw(node, "afterName")?.trim()) {
            this.parseAtruleRawsAfterName(node, astNode)
        }
        if (this.getRaw(node, "between")?.trim()) {
            this.parseAtruleRawsBetween(node, astNode)
        }

        return astNode
    }

    private parseAtruleRawsAfterName(node: PostCSSAtRule, astNode: VCSSAtRule) {
        const afterName = this.getRaw(node, "afterName")

        const afterNameStart =
            astNode.range[0] + // start index of at-rule
            astNode.identifier.length + // `@`
            astNode.name.length // `nest`
        const postcssRoot = this.parseInternal(afterName || "") as PostCSSRoot

        this._postcssNodeToASTNode(
            this.sourceCode.getLocFromIndex(afterNameStart),
            postcssRoot,
        )
    }

    private parseAtruleRawsBetween(node: PostCSSAtRule, astNode: VCSSAtRule) {
        const between = this.getRaw(node, "between")

        const rawParams = this.getRaw(node, "params")?.raw ?? node.params
        const betweenStart =
            astNode.range[0] + // start index of at-rule
            astNode.identifier.length + // `@`
            astNode.name.length + // `nest`
            (this.getRaw(node, "afterName") || "").length + // comments and spaces
            rawParams.length

        const postcssRoot = this.parseInternal(between || "") as PostCSSRoot
        this._postcssNodeToASTNode(
            this.sourceCode.getLocFromIndex(betweenStart),
            postcssRoot,
        )
    }

    /**
     * Convert decl Node
     * @param  {object} node  The node.
     * @param  {SourceLocation} loc  The location.
     * @param  {number} start  The index of start.
     * @param  {number} end  The index of end.
     * @param  {Node} parent  The parent node.
     * @returns {VCSSDeclarationProperty}
     */
    protected convertDeclNode(
        node: PostCSSDeclaration,
        loc: SourceLocation,
        start: number,
        end: number,
        parent: VCSSContainerNode,
    ): VCSSNode | null {
        // adjust star hack
        // `*color: red`
        //  ^
        let property = node.prop
        let starLength = 1
        let textProp = this.sourceCode.text.slice(
            start,
            start + property.length,
        )
        while (property !== textProp) {
            property = textProp.slice(0, starLength) + node.prop

            starLength++
            textProp = this.sourceCode.text.slice(
                start,
                start + property.length,
            )
        }

        return new VCSSDeclarationProperty(node, loc, start, end, {
            parent,
            property,
        })
    }

    /**
     * Convert comment Node
     * @param  {object} node  The node.
     * @param  {SourceLocation} loc  The location.
     * @param  {number} start  The index of start.
     * @param  {number} end  The index of end.
     * @param  {Node} parent  The parent node.
     * @returns {void}
     */
    protected convertCommentNode(
        node: PostCSSComment,
        loc: SourceLocation,
        start: number,
        end: number,
        parent: VCSSContainerNode,
    ): VCSSNode | null {
        this.commentContainer.push(
            new VCSSComment(node, node.text, loc, start, end, { parent }),
        )
        return null
    }

    /**
     * Convert unknown Node
     * @param  {object} node  The node.
     * @param  {SourceLocation} loc  The location.
     * @param  {number} start  The index of start.
     * @param  {number} end  The index of end.
     * @param  {Node} parent  The parent node.
     * @returns {Node}
     */
    protected convertUnknownTypeNode(
        node: PostCSSNode,
        loc: SourceLocation,
        start: number,
        end: number,
        parent: VCSSContainerNode,
    ): VCSSNode | null {
        return new VCSSUnknown(node, loc, start, end, {
            parent,
            unknownType: node.type,
        })
    }

    protected getRaw<N extends PostCSSNode, K extends keyof N["raws"] & string>(
        node: N,
        keyName: K,
    ): N["raws"][K] {
        return (node.raws as any)[keyName]
    }

    /* eslint-enable class-methods-use-this */
}

/**
 * Convert PostCSS location to ESLint location.
 * @param {LineAndColumnData} offsetLocation start location of selector.
 * @param {object} loc the PostCSS location to comvert
 * @return {LineAndColumnData} converted location.
 */
function getESLintLineAndColumnFromPostCSSPosition(
    offsetLocation: LineAndColumnData,
    loc: PostCSSLoc,
) {
    let { line } = loc
    let column = loc.column - 1 // Change to 0 base.
    if (line === 1) {
        line = offsetLocation.line
        column = offsetLocation.column + column
    } else {
        line = offsetLocation.line + line - 1
    }
    return { line, column }
}

/**
 * Convert PostCSS location to ESLint location.
 * @param {LineAndColumnData} offsetLocation location of inside the `<style>` node.
 * @param {object} node the PostCSS node to comvert
 * @param {"start"|"end"} locName the name of location
 * @return {LineAndColumnData} converted location.
 */
function getESLintLineAndColumnFromPostCSSNode(
    offsetLocation: LineAndColumnData,
    node: PostCSSNode,
    locName: "start" | "end",
): LineAndColumnData | null {
    const sourceLoc = node.source[locName]
    if (!sourceLoc) {
        return null
    }
    const { line, column } = getESLintLineAndColumnFromPostCSSPosition(
        offsetLocation,
        sourceLoc,
    )
    if (locName === "end") {
        // End column is shifted by one.
        return { line, column: column + 1 }
    }
    return { line, column }
}

interface ConvertNodeTypes {
    root: "convertRootNode"
    atrule: "convertAtruleNode"
    rule: "convertRuleNode"
    decl: "convertDeclNode"
    comment: "convertCommentNode"
}
const convertNodeTypes: ConvertNodeTypes = {
    root: "convertRootNode",
    atrule: "convertAtruleNode",
    rule: "convertRuleNode",
    decl: "convertDeclNode",
    comment: "convertCommentNode",
}

/**
 * Get convert method name from given type
 */
function typeToConvertMethodName(
    type: keyof ConvertNodeTypes,
): "convertUnknownTypeNode" | ConvertNodeTypes[keyof ConvertNodeTypes] {
    return convertNodeTypes[type] || "convertUnknownTypeNode"
}
