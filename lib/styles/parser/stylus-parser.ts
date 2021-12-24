import postcssStyl from "postcss-styl"
import type * as postcss from "postcss"
import { CSSParser } from "./css-parser"
import type { VCSSContainerNode, VCSSNode } from "../ast"
import { VCSSInlineComment } from "../ast"
import type { SourceLocation, PostCSSComment, PostCSSNode } from "../../types"
import { StylusSelectorParser } from "./selector/stylus-selector-parser"
/**
 * Stylus Parser
 */
export class StylusParser extends CSSParser {
    protected parseInternal(css: string): postcss.Root {
        return postcssStyl.parse(css) as postcss.Root
    }

    protected createSelectorParser(): StylusSelectorParser {
        return new StylusSelectorParser(this.sourceCode, this.commentContainer)
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
        if (
            keyName === "between" ||
            keyName === "before" ||
            keyName === "after"
        ) {
            const stylus = super.getRaw(
                node as never,
                `stylus${keyName[0].toUpperCase()}${keyName.slice(1)}`,
            )
            if (stylus) {
                return stylus
            }
        }
        const raw = super.getRaw(node, keyName)
        if (raw != null) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- check stylus
            const stylus = (raw as any).stylus
            if (stylus != null) {
                return {
                    raw: stylus,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- stylus
                    value: (raw as any).value,
                } as never
            }
        }

        return raw
    }
}
