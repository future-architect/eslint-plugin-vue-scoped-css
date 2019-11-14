import postcss from "postcss"
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
import {
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
import { isDefined } from "../utils"

/**
 * CSS Parser
 */
export class CSSParser {
    protected readonly sourceCode: SourceCode
    protected commentContainer: VCSSCommentNode[]
    private _selectorParser: CSSSelectorParser | null = null
    private readonly lang: string
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

        try {
            const postcssRoot = this.parseInternal(css) as PostCSSRoot

            const rootNode = this._postcssNodeToASTNode(
                offsetLocation,
                postcssRoot,
            )
            rootNode.comments = this.commentContainer
            return rootNode
        } catch (e) {
            const errorLoc = getESLintLineAndColumnFromPostCSSPosition(
                offsetLocation,
                e,
            )
            const errorIndex = this.sourceCode.getIndexFromLoc(errorLoc)
            const message = e.reason || e.message
            const errorNode = new VCSSParsingError(
                null as any,
                {
                    start: errorLoc,
                    end: errorLoc,
                },
                errorIndex,
                errorIndex,
                {
                    lang: this.lang,
                },
            )
            ;(errorNode as any).message = message

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
                    errors: [errorNode],
                    lang: this.lang,
                },
            )
        }
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
                start + (node as PostCSSRoot).source.input.css.length,
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
                .map(n =>
                    this._postcssNodeToASTNode(offsetLocation, n, astNode),
                )
                .filter(isDefined)
        }
        return astNode
    }

    /* eslint-disable class-methods-use-this */

    protected parseInternal(css: string): postcss.Root {
        return postcss.parse(css)
    }

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
    ) {
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
    ) {
        const astNode = new VCSSStyleRule(node, loc, start, end, { parent })
        astNode.selectors = this.selectorParser.parse(
            astNode.rawSelectorText,
            astNode.loc.start,
            astNode,
        )

        if (node.raws.between?.trim()) {
            this.parseRuleRawsBetween(node, astNode)
        }

        return astNode
    }

    protected parseRuleRawsBetween(node: PostCSSRule, astNode: VCSSNode) {
        const { between } = node.raws
        const rawSelector = node.raws.selector?.raw ?? node.selector
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
    ) {
        const astNode = new VCSSAtRule(node, loc, start, end, { parent })
        if (node.name === "nest") {
            // The parameters following `@nest` are parsed as selectors.
            const paramsStartIndex =
                astNode.range[0] + // start index of at-rule
                1 + // `@`
                astNode.name.length + // `nest`
                (node.raws.afterName || "").length // comments and spaces

            astNode.selectors = this.selectorParser.parse(
                astNode.rawParamsText,
                this.sourceCode.getLocFromIndex(paramsStartIndex),
                astNode,
            )
        }

        if (node.raws.afterName?.trim()) {
            this.parseAtruleRawsAfterName(node, astNode)
        }
        if (node.raws.between?.trim()) {
            this.parseAtruleRawsBetween(node, astNode)
        }

        return astNode
    }

    private parseAtruleRawsAfterName(node: PostCSSAtRule, astNode: VCSSAtRule) {
        const { afterName } = node.raws

        const afterNameStart =
            astNode.range[0] + // start index of at-rule
            1 + // `@`
            astNode.name.length // `nest`
        const postcssRoot = this.parseInternal(afterName || "") as PostCSSRoot

        this._postcssNodeToASTNode(
            this.sourceCode.getLocFromIndex(afterNameStart),
            postcssRoot,
        )
    }

    private parseAtruleRawsBetween(node: PostCSSAtRule, astNode: VCSSAtRule) {
        const { between } = node.raws

        const rawParams = node.raws.params?.raw ?? node.params
        const betweenStart =
            astNode.range[0] + // start index of at-rule
            1 + // `@`
            astNode.name.length + // `nest`
            (node.raws.afterName || "").length + // comments and spaces
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
    ) {
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
    ): null {
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
    ) {
        return new VCSSUnknown(node, loc, start, end, {
            parent,
            unknownType: node.type,
        })
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
