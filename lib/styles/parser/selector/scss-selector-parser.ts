import type {
    PostCSSSPRootNode,
    SourceLocation,
    PostCSSSPCommentNode,
} from "../../../types"
import { CSSSelectorParser } from "./css-selector-parser"
import selectorParser from "postcss-selector-parser"
import type { VCSSSelectorNode, VCSSSelector } from "../../ast"
import { VCSSInlineComment } from "../../ast"
import { replaceSelector, restoreReplacedSelector } from "./replace-utils"

export class SCSSSelectorParser extends CSSSelectorParser {
    protected parseInternal(selector: string): PostCSSSPRootNode {
        const replaceSelectorContext = replaceSelector(
            selector,
            [
                {
                    regexp: /#\{[\s\S]+?\}/gu, // interpolation
                    replace: (_res, random) => `_${random}_`,
                },
            ],
            [
                {
                    regexp: /\/\/[^\n\r\u2028\u2029]*/gu, // inline comment
                    replace: (_res, random) => `/*${random}*/`,
                },
            ],
        )

        const result: PostCSSSPRootNode = selectorParser().astSync(
            replaceSelectorContext.cssSelector,
        )
        if (!replaceSelectorContext.hasReplace()) {
            return result
        }
        return restoreReplacedSelector(
            result,
            replaceSelectorContext,
        ) as PostCSSSPRootNode
    }

    protected parseCommentsInternal(selector: string): PostCSSSPRootNode {
        return this.parseInternal(selector)
    }

    /**
     * Convert comment Node
     * @param  {object} node  The node.
     * @param  {SourceLocation} loc  The location.
     * @param  {number} start  The index of start.
     * @param  {number} end  The index of end.
     * @param  {Node} parent  The parent node.
     * @returns {null}
     */
    protected convertCommentNode(
        node: PostCSSSPCommentNode,
        loc: SourceLocation,
        start: number,
        end: number,
        parent: VCSSSelector,
    ): VCSSSelectorNode | null {
        if (node.value.startsWith("//")) {
            // inline comment
            const text = node.value.replace(/^\s*\/\//u, "")
            this.commentContainer.push(
                new VCSSInlineComment(node, text, loc, start, end, {
                    parent,
                }),
            )
            return null
        }
        return super.convertCommentNode(node, loc, start, end, parent)
    }
}
