import type {
    PostCSSSPRootNode,
    SourceLocation,
    PostCSSSPCommentNode,
    PostCSSSPNode,
    PostCSSSPNestingNode,
} from "../../../types"
import { CSSSelectorParser } from "./css-selector-parser"
import selectorParser from "postcss-selector-parser"
import type { VCSSSelectorNode, VCSSSelector } from "../../ast"
import { VCSSInlineComment } from "../../ast"
import { replaceSelector, restoreReplacedSelector } from "./replace-utils"

/**
 * Replace stylus nesting node
 */
function replaceStylusNesting(
    _result: RegExpExecArray,
    random: string,
): string {
    return `[${random}]`
}

/**
 * Restore stylus nesting node
 */
function restoreStylusNesting(
    attribute: PostCSSSPNode,
    random: string,
    original: string,
): PostCSSSPNestingNode | null {
    if (attribute.type !== "attribute") {
        return null
    }
    if (!attribute.attribute.includes(random)) {
        return null
    }
    const node = selectorParser.nesting({ ...attribute })
    node.value = original
    return node
}

export class StylusSelectorParser extends CSSSelectorParser {
    protected parseInternal(selector: string): PostCSSSPRootNode {
        const replaceSelectorContext = replaceSelector(
            selector,
            [
                {
                    regexp: /\{[\s\S]+?\}/gu, // interpolation
                    replace: (_res, random) => `_${random}_`,
                },
                {
                    regexp: /\^\[[\s\S]+?\]/gu, // partial reference
                    replace: replaceStylusNesting,
                    restore: restoreStylusNesting,
                },
                {
                    regexp: /~\//gu, // initial reference
                    replace: replaceStylusNesting,
                    restore: restoreStylusNesting,
                },
                {
                    regexp: /(?:\.\.\/)+/gu, // relative reference
                    replace: replaceStylusNesting,
                    restore: restoreStylusNesting,
                },
                {
                    regexp: /\//gu, // root reference
                    replace: replaceStylusNesting,
                    restore: restoreStylusNesting,
                },
            ],
            [
                {
                    regexp: /\/\/[^\n\r\u2028\u2029]*/gu, // inline comment
                    replace: (_res, random) => `/*${random}*/`,
                },
            ],
            [
                {
                    regexp: /([\n\r\u2028\u2029])(\s*)/gu, // comma
                    replace(res, _random, { beforeCss }) {
                        const before = [...beforeCss]
                        let prev = before.pop()
                        while (
                            prev != null &&
                            (prev.startsWith("/*") || !prev.trim())
                        ) {
                            // skip comments
                            prev = before.pop()
                        }
                        if (prev?.trim().endsWith(",")) {
                            return res[0]
                        }
                        let after = selector.slice(res.index)
                        let next
                        while (
                            (next = after
                                .replace(
                                    /^\s*\/\/[^\n\r\u2028\u2029]*\s*/gu,
                                    "",
                                )
                                .replace(/^\s*\/\*[\s\S]+?\*\/\s*/gu, "")
                                .trim()) &&
                            next !== after
                        ) {
                            // skip comments
                            after = next
                        }
                        if (after.startsWith(",")) {
                            return res[0]
                        }
                        return `${res[1]},${res[2]}`
                    },
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
