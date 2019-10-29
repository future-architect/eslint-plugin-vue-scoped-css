import postcssScss from "postcss-scss"
import { CSSParser } from "./css-parser"
import { VCSSInlineComment, VCSSContainerNode, VCSSStyleRule } from "../ast"
import { SourceLocation, PostCSSComment, PostCSSRule } from "../../types"
import { SCSSSelectorParser } from "./selector/scss-selector-parser"
/**
 * SCSS Parser
 */
export class SCSSParser extends CSSParser {
    /* eslint-disable class-methods-use-this */
    protected parseInternal(css: string) {
        return postcssScss.parse(css)
    }
    protected createSelectorParser(): SCSSSelectorParser {
        return new SCSSSelectorParser(this.sourceCode, this.commentContainer)
    }
    /* eslint-enable class-methods-use-this */

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
        let rawSelectorText = undefined
        const rawsSelector = node.raws.selector
        if (rawsSelector) {
            rawSelectorText = (rawsSelector as any).scss
        }
        const astNode = new VCSSStyleRule(node, loc, start, end, {
            parent,
            rawSelectorText,
        })
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
        if (node.raws?.inline) {
            this.commentContainer.push(
                new VCSSInlineComment(node, node.text, loc, start, end, {
                    parent,
                }),
            )
        } else {
            super.convertCommentNode(node, loc, start, end, parent)
        }
        return null
    }
}
