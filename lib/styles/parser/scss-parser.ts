import postcssScss from "postcss-scss"
import { CSSParser } from "./css-parser"
import { VCSSInlineComment, VCSSContainerNode, VCSSNode } from "../ast"
import type { SourceLocation, PostCSSComment, PostCSSNode } from "../../types"
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
        if (node.raws?.inline) {
            this.commentContainer.push(
                new VCSSInlineComment(node, node.text, loc, start, end, {
                    parent,
                }),
            )
            return null
        }
        return super.convertCommentNode(node, loc, start, end, parent)
    }

    protected getRaw<N extends PostCSSNode, K extends keyof N["raws"] & string>(
        node: N,
        keyName: K,
    ): N["raws"][K] {
        const raw = super.getRaw(node, keyName)
        if (raw != null) {
            const scss = (raw as any).scss
            if (scss != null) {
                return {
                    raw: scss,
                    value: (raw as any).value,
                } as any
            }
        }

        return raw
    }
}
