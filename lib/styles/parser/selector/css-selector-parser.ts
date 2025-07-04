import selectorParser from "postcss-selector-parser";
import type {
  VCSSCommentNode,
  VCSSStyleRule,
  VCSSAtRule,
  VCSSSelectorNode,
  VCSSNode,
  VCSSContainerNode,
  VCSSSelectorValueNode,
} from "../../ast";
import {
  VCSSSelector,
  VCSSTypeSelector,
  VCSSIDSelector,
  VCSSClassSelector,
  VCSSNestingSelector,
  VCSSUniversalSelector,
  VCSSAttributeSelector,
  VCSSSelectorPseudo,
  VCSSSelectorCombinator,
  VCSSUnknownSelector,
  VCSSComment,
} from "../../ast";
import {
  isSelectorCombinator,
  isDescendantCombinator,
  isVueSpecialPseudo,
  normalizePseudoParams,
  isVDeepPseudoV2,
} from "../../utils/selectors";
import type {
  SourceCode,
  LineAndColumnData,
  SourceLocation,
  PostCSSSPNode,
  PostCSSSPContainer,
  PostCSSSPStringNode,
  PostCSSSPSelector,
  PostCSSSPTypeNode,
  PostCSSSPClassNameNode,
  PostCSSSPNestingNode,
  PostCSSSPUniversalNode,
  PostCSSSPAttributeNode,
  PostCSSSPPseudoNode,
  PostCSSSPCombinatorNode,
  PostCSSSPCommentNode,
  PostCSSSPIDNode,
  PostCSSSPRootNode,
} from "../../../types";
import { isPostCSSSPContainer } from "../utils";
import { isDefined } from "../../../utils/utils";

export class CSSSelectorParser {
  private readonly sourceCode: SourceCode;

  protected commentContainer: VCSSCommentNode[];

  protected lang = "css";

  /**
   * constructor.
   * @param {SourceCode} sourceCode the SourceCode object that you can use to work with the source that was passed to ESLint.
   * @param {Node[]} commentContainer comment nodes container
   */
  public constructor(
    sourceCode: SourceCode,
    commentContainer: VCSSCommentNode[],
  ) {
    this.sourceCode = sourceCode;
    this.commentContainer = commentContainer;
  }

  /**
   * Parse CSS selector.
   * @param {string} rawSelector `<style>` node
   * @param {LineAndColumnData} offsetLocation start location of selector.
   * @param {Node} parent parent node
   * @return {Node[]} parsed result
   */
  public parse(
    rawSelector: string,
    offsetLocation: LineAndColumnData,
    parent: VCSSStyleRule | VCSSAtRule,
  ): VCSSSelectorNode[] {
    const selectorParserRoot = this.parseInternal(rawSelector);

    return this._postcssSelectorParserNodeChiildrenToASTNodes(
      offsetLocation,
      selectorParserRoot,
      parent,
    );
  }

  protected parseInternal(selector: string): PostCSSSPRootNode {
    return selectorParser().astSync(selector);
  }

  protected parseCommentsInternal(selector: string): PostCSSSPRootNode {
    return selectorParser().astSync(selector);
  }

  /**
   * Convert `postcss-selector-parser` node to node that can be handled by ESLint.
   * @param {LineAndColumnData} offsetLocation start location of selector.
   * @param {object} node the `postcss-selector-parser` node to comvert
   * @param {Node} parent parent node
   * @return {Node[]} converted nodes.
   */
  private _postcssSelectorParserNodeChiildrenToASTNodes(
    offsetLocation: LineAndColumnData,
    node: PostCSSSPRootNode,
    parent: VCSSStyleRule | VCSSAtRule,
  ): VCSSSelector[];

  private _postcssSelectorParserNodeChiildrenToASTNodes(
    offsetLocation: LineAndColumnData,
    node: PostCSSSPContainer,
    parent: VCSSSelector,
  ): VCSSSelectorValueNode[];

  private _postcssSelectorParserNodeChiildrenToASTNodes(
    offsetLocation: LineAndColumnData,
    node: PostCSSSPPseudoNode,
    parent: VCSSSelectorPseudo,
  ): VCSSSelector[];

  private _postcssSelectorParserNodeChiildrenToASTNodes(
    offsetLocation: LineAndColumnData,
    node: PostCSSSPContainer | PostCSSSPPseudoNode,
    parent: VCSSStyleRule | VCSSAtRule | VCSSSelector | VCSSSelectorPseudo,
  ): VCSSSelectorNode[] {
    const astNodes = removeInvalidDescendantCombinator(
      node.nodes
        .map((child) =>
          this._postcssSelectorParserNodeToASTNode(
            offsetLocation,
            child,
            parent,
          ),
        )
        .filter(isDefined),
    );
    if (astNodes.length !== node.nodes.length) {
      // adjust locations
      if (node.type === "selector") {
        // adjust start location
        const firstAstNode = astNodes[0];
        parent.loc.start = { ...firstAstNode.loc.start };
        parent.start = firstAstNode.start;
        parent.range = [firstAstNode.start, parent.range[1]];
      }
      if (node.type === "selector") {
        // adjust end location
        const lastAstNode = astNodes[astNodes.length - 1];
        parent.loc.end = { ...lastAstNode.loc.end };
        parent.end = lastAstNode.end;
        parent.range = [parent.range[0], lastAstNode.end];
      }
    }
    return astNodes;
  }

  /**
   * Convert `postcss-selector-parser` node to node that can be handled by ESLint.
   * @param {LineAndColumnData} offsetLocation start location of selector.
   * @param {object} node the `postcss-selector-parser` node to convert
   * @param {Node} parent parent node
   * @return {Node} converted node.
   */
  private _postcssSelectorParserNodeToASTNode(
    offsetLocation: LineAndColumnData,
    node: PostCSSSPNode,
    parent: VCSSStyleRule | VCSSAtRule | VCSSSelector | VCSSSelectorPseudo,
  ): VCSSSelectorNode | null {
    const { sourceCode } = this;

    /**
     * Get index from location
     */
    function getIndexFromLoc(loc: LineAndColumnData): number {
      if (loc.column >= 0) {
        return sourceCode.getIndexFromLoc(loc);
      }
      // A column index can be negative if the starting position contains a newline.
      const index = sourceCode.getIndexFromLoc({
        line: loc.line,
        column: 0,
      });
      return index + loc.column;
    }

    const loc = {
      start: getESLintLineAndColumnFromPostCSSSelectorParserNode(
        offsetLocation,
        node,
        "start",
      ),
      end: getESLintLineAndColumnFromPostCSSSelectorParserNode(
        offsetLocation,
        node,
        "end",
      ),
    };
    const start = getIndexFromLoc(loc.start);
    const end = getIndexFromLoc(loc.end);

    const astNode = this[typeToConvertMethodName(node.type)](
      node as never,
      loc,
      start,
      end,
      parent as never,
    );

    if (astNode == null) {
      return null;
    }

    this.parseRawsSpaces(astNode, node, parent);

    if (isPostCSSSPContainer(node)) {
      if (astNode.type === "VCSSSelectorPseudo") {
        astNode.nodes = normalizePseudoParams(
          astNode,
          this._postcssSelectorParserNodeChiildrenToASTNodes(
            offsetLocation,
            node as PostCSSSPPseudoNode,
            astNode,
          ),
        );
      } else if (astNode.type === "VCSSSelector") {
        astNode.nodes = this._postcssSelectorParserNodeChiildrenToASTNodes(
          offsetLocation,
          node,
          astNode,
        );
      }
    }

    return astNode;
  }

  protected parseRawsSpaces(
    astNode: VCSSSelectorNode,
    node: PostCSSSPNode,
    parent: VCSSStyleRule | VCSSAtRule | VCSSSelector | VCSSSelectorPseudo,
  ): void {
    if (!hasRaws(node) || !node.raws.spaces) {
      return;
    }
    const { after, before } = node.raws.spaces;
    if (after?.trim()) {
      const selectorParserRoot = this.parseCommentsInternal(after);
      selectorParserRoot.walkComments((comment) => {
        this._postcssSelectorParserNodeToASTNode(
          astNode.loc.end,
          comment,
          parent,
        );
      });
    }
    if (before?.trim()) {
      const startLoc = this.sourceCode.getLocFromIndex(
        astNode.range[0] - before.length,
      );
      const selectorParserRoot = this.parseCommentsInternal(before);
      selectorParserRoot.walkComments((comment) => {
        this._postcssSelectorParserNodeToASTNode(startLoc, comment, parent);
      });
    }
  }

  /**
   * Convert selector Node
   * @param  {object} node  The node.
   * @param  {SourceLocation} loc  The location.
   * @param  {number} start  The index of start.
   * @param  {number} end  The index of end.
   * @param  {Node} parent  The parent node.
   * @returns {VCSSSelector}
   */
  protected convertSelectorNode(
    node: PostCSSSPSelector,
    loc: SourceLocation,
    start: number,
    end: number,
    parent: VCSSNode,
  ): VCSSSelectorNode | null {
    const sourceCode = this.sourceCode;
    const code = sourceCode.text;
    let source = code.slice(start, end);
    const beforeSpaces = /^\s+/u.exec(source);
    if (beforeSpaces?.[0]) {
      // adjust before spaces
      // `.foo, .bar`
      //       ^

      // eslint-disable-next-line no-param-reassign -- ignore
      start = start + beforeSpaces[0].length;
      loc.start = this.sourceCode.getLocFromIndex(start);
      source = source.slice(beforeSpaces[0].length);
    }
    const afterSpaces = /\s+$/u.exec(source);
    if (afterSpaces?.[0]) {
      // adjust after spaces

      // eslint-disable-next-line no-param-reassign -- ignore
      end = end - afterSpaces[0].length;
      loc.end = this.sourceCode.getLocFromIndex(end);
      source = source.slice(0, -afterSpaces[0].length);
    }

    adjustBeforeParenLocation();
    adjustAfterParenLocation();

    return new VCSSSelector(node, loc, start, end, {
      parent: parent as VCSSStyleRule | VCSSAtRule,
    });

    /**
     * Adjust before paren token
     * `:not(.bar)`
     *      ^
     */
    function adjustBeforeParenLocation() {
      const beforeTrivials = /^\(\s*/u.exec(source);
      if (!beforeTrivials?.[0]) return;
      let withinParen = false;

      for (
        // Search from `end - 1` since it may be in the current source.
        let index = end - 1;
        index < code.length;
        index++
      ) {
        const ch = code[index];
        if (ch === ")") {
          withinParen = true;
          break;
        } else if (ch?.trim() && index !== end - 1) {
          return;
        }
      }
      if (!withinParen) return;
      // eslint-disable-next-line no-param-reassign -- ignore
      start = start + beforeTrivials[0].length;
      loc.start = sourceCode.getLocFromIndex(start);
      source = source.slice(beforeTrivials[0].length);
    }

    /**
     * Adjust after paren token
     * `:not(.bar)`
     *           ^
     */
    function adjustAfterParenLocation() {
      const afterTrivials = /\s*\)$/u.exec(source);
      if (!afterTrivials?.[0]) return;
      let withinParen = false;
      for (let index = start - 1; index >= 0; index--) {
        const ch = code[index];
        if (ch === "(") {
          withinParen = true;
          break;
        } else if (ch?.trim()) {
          return;
        }
      }
      if (!withinParen) return;
      // eslint-disable-next-line no-param-reassign -- ignore
      end = end - afterTrivials[0].length;
      loc.end = sourceCode.getLocFromIndex(end);
      source = source.slice(0, -afterTrivials[0].length);
    }
  }

  /**
   * Convert tag Node
   * @param  {object} node  The node.
   * @param  {SourceLocation} loc  The location.
   * @param  {number} start  The index of start.
   * @param  {number} end  The index of end.
   * @param  {Node} parent  The parent node.
   * @returns {VCSSTypeSelector}
   */
  protected convertTagNode(
    node: PostCSSSPTypeNode,
    loc: SourceLocation,
    start: number,
    end: number,
    parent: VCSSSelector,
  ): VCSSSelectorNode | null {
    return new VCSSTypeSelector(node, loc, start, end, {
      parent,
    });
  }

  /**
   * Convert id Node
   * @param  {object} node  The node.
   * @param  {SourceLocation} loc  The location.
   * @param  {number} start  The index of start.
   * @param  {number} end  The index of end.
   * @param  {Node} parent  The parent node.
   * @returns {VCSSIDSelector}
   */
  protected convertIdNode(
    node: PostCSSSPIDNode,
    loc: SourceLocation,
    start: number,
    end: number,
    parent: VCSSSelector,
  ): VCSSSelectorNode | null {
    return new VCSSIDSelector(node, loc, start, end, {
      parent,
    });
  }

  /**
   * Convert class Node
   * @param  {object} node  The node.
   * @param  {SourceLocation} loc  The location.
   * @param  {number} start  The index of start.
   * @param  {number} end  The index of end.
   * @param  {Node} parent  The parent node.
   * @returns {VCSSClassSelector}
   */
  protected convertClassNode(
    node: PostCSSSPClassNameNode,
    loc: SourceLocation,
    start: number,
    end: number,
    parent: VCSSSelector,
  ): VCSSSelectorNode | null {
    return new VCSSClassSelector(node, loc, start, end, {
      parent,
    });
  }

  /**
   * Convert nesting Node
   * @param  {object} node  The node.
   * @param  {SourceLocation} loc  The location.
   * @param  {number} start  The index of start.
   * @param  {number} end  The index of end.
   * @param  {Node} parent  The parent node.
   * @returns {VCSSNestingSelector}
   */
  protected convertNestingNode(
    node: PostCSSSPNestingNode,
    loc: SourceLocation,
    start: number,
    end: number,
    parent: VCSSSelector,
  ): VCSSSelectorNode | null {
    return new VCSSNestingSelector(node, loc, start, end, {
      parent,
    });
  }

  /**
   * Convert universal Node
   * @param  {object} node  The node.
   * @param  {SourceLocation} loc  The location.
   * @param  {number} start  The index of start.
   * @param  {number} end  The index of end.
   * @param  {Node} parent  The parent node.
   * @returns {VCSSUniversalSelector}
   */
  protected convertUniversalNode(
    node: PostCSSSPUniversalNode,
    loc: SourceLocation,
    start: number,
    end: number,
    parent: VCSSSelector,
  ): VCSSSelectorNode | null {
    return new VCSSUniversalSelector(node, loc, start, end, {
      parent,
    });
  }

  /**
   * Convert attribute Node
   * @param  {object} node  The node.
   * @param  {SourceLocation} loc  The location.
   * @param  {number} start  The index of start.
   * @param  {number} end  The index of end.
   * @param  {Node} parent  The parent node.
   * @returns {VCSSAttributeSelector}
   */
  protected convertAttributeNode(
    node: PostCSSSPAttributeNode,
    loc: SourceLocation,
    start: number,
    end: number,
    parent: VCSSSelector,
  ): VCSSSelectorNode | null {
    return new VCSSAttributeSelector(node, loc, start, end, {
      parent,
    });
  }

  /**
   * Convert pseudo Node
   * @param  {object} node  The node.
   * @param  {SourceLocation} loc  The location.
   * @param  {number} start  The index of start.
   * @param  {number} end  The index of end.
   * @param  {Node} parent  The parent node.
   * @returns {VCSSSelectorPseudo}
   */
  protected convertPseudoNode(
    node: PostCSSSPPseudoNode,
    loc: SourceLocation,
    start: number,
    end: number,
    parent: VCSSSelector,
  ): VCSSSelectorNode | null {
    return new VCSSSelectorPseudo(node, loc, start, end, {
      parent,
    });
  }

  /**
   * Convert combinator Node
   * @param  {object} node  The node.
   * @param  {SourceLocation} loc  The location.
   * @param  {number} start  The index of start.
   * @param  {number} end  The index of end.
   * @param  {Node} parent  The parent node.
   * @returns {VCSSSelectorCombinator}
   */
  protected convertCombinatorNode(
    node: PostCSSSPCombinatorNode,
    loc: SourceLocation,
    start: number,
    end: number,
    parent: VCSSSelector,
  ): VCSSSelectorNode | null {
    const astNode = new VCSSSelectorCombinator(node, loc, start, end, {
      parent,
    });
    // The end index of Deep Combinator may be invalid, so adjust it.
    adjustEndLocation(astNode, start + astNode.value.length, this.sourceCode);
    return astNode;
  }

  /**
   * Convert string Node
   * @param  {object} node  The node.
   * @param  {SourceLocation} loc  The location.
   * @param  {number} start  The index of start.
   * @param  {number} end  The index of end.
   * @param  {Node} parent  The parent node.
   * @returns {VCSSSelectorCombinator}
   */
  protected convertStringNode(
    node: PostCSSSPStringNode,
    loc: SourceLocation,
    start: number,
    end: number,
    parent: VCSSSelector,
  ): VCSSSelectorNode | null {
    // unknown string
    const astNode = new VCSSUnknownSelector(node, loc, start, end, {
      parent,
    });
    // The end index may be invalid, so adjust it.
    adjustEndLocation(astNode, start + astNode.value.length, this.sourceCode);
    return astNode;
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
    const text = node.value.replace(/^\s*\/\*/u, "").replace(/\*\/\s*$/u, "");
    this.commentContainer.push(
      new VCSSComment(node, text, loc, start, end, {
        parent,
      }),
    );

    return null;
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
    node: PostCSSSPNode,
    loc: SourceLocation,
    start: number,
    end: number,
    parent: VCSSSelector,
  ): VCSSUnknownSelector {
    return new VCSSUnknownSelector(node, loc, start, end, {
      parent,
    });
  }
}

/**
 * Convert `postcss-selector-parser` location to ESLint location.
 * @param {LineAndColumnData} offsetLocation start location of selector.
 * @param {object} node the `postcss-selector-parser` node to comvert
 * @param {"start"|"end"} locName the name of location
 * @return {LineAndColumnData} converted location.
 */
function getESLintLineAndColumnFromPostCSSSelectorParserNode(
  offsetLocation: LineAndColumnData,
  node: PostCSSSPNode,
  locName: "start" | "end",
) {
  const sourceLoc = (node.source && node.source[locName]) || {
    line: 0,
    column: 1,
  };
  let { line } = sourceLoc;
  let column = sourceLoc.column - 1; // Change to 0 base.
  if (line === 1) {
    line = offsetLocation.line;
    column = offsetLocation.column + column;
  } else {
    line = offsetLocation.line + line - 1;
  }
  if (locName === "end") {
    // End column is shifted by one.
    column++;
  }
  return { line, column };
}

/**
 * Adjust end location
 */
function adjustEndLocation(
  astNode: VCSSSelectorCombinator | VCSSUnknownSelector,
  endIndex: number,
  sourceCode: SourceCode,
) {
  if (astNode.range[1] === endIndex) {
    return;
  }
  astNode.range[1] = endIndex;
  astNode.end = endIndex;
  astNode.loc.end = sourceCode.getLocFromIndex(endIndex);

  // update parent locations
  let p: VCSSContainerNode | VCSSSelector | VCSSSelectorPseudo = astNode.parent;
  while (p && p.end < endIndex) {
    p.end = endIndex;
    p.range[1] = endIndex;
    p.loc.end = { ...astNode.loc.end };

    p = p.parent;
  }
}

/**
 * Remove invalid descendant combinators
 */
function removeInvalidDescendantCombinator(
  nodes: VCSSSelectorNode[],
): VCSSSelectorNode[] {
  const results = [];

  let prev = null;
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    if (isDescendantCombinator(node)) {
      if (results.length === 0) {
        continue;
      }
      if (isSelectorCombinator(prev) || isVDeepPseudoV2(prev)) {
        continue;
      }
      const next = nodes[index + 1];
      if (isSelectorCombinator(next)) {
        continue;
      }
    } else if (isVueSpecialPseudo(node)) {
      if (prev && !isSelectorCombinator(prev)) {
        results.push(
          new VCSSSelectorCombinator(
            node.node as never,
            node.loc,
            node.start,
            node.end,
            { parent: node.parent, value: " " },
          ),
        );
      }
    }
    results.push(node);
    prev = node;
  }

  return results;
}

interface ConvertNodeTypes {
  tag: "convertTagNode";
  string: "convertStringNode";
  selector: "convertSelectorNode";
  pseudo: "convertPseudoNode";
  nesting: "convertNestingNode";
  id: "convertIdNode";
  comment: "convertCommentNode";
  combinator: "convertCombinatorNode";
  class: "convertClassNode";
  attribute: "convertAttributeNode";
  universal: "convertUniversalNode";
}
const convertNodeTypes: ConvertNodeTypes = {
  tag: "convertTagNode",
  string: "convertStringNode",
  selector: "convertSelectorNode",
  pseudo: "convertPseudoNode",
  nesting: "convertNestingNode",
  id: "convertIdNode",
  comment: "convertCommentNode",
  combinator: "convertCombinatorNode",
  class: "convertClassNode",
  attribute: "convertAttributeNode",
  universal: "convertUniversalNode",
};

/**
 * Get convert method name from given type
 */
function typeToConvertMethodName(
  type: keyof ConvertNodeTypes | "root",
): "convertUnknownTypeNode" | ConvertNodeTypes[keyof ConvertNodeTypes] {
  if (type === "root") {
    return "convertUnknownTypeNode";
  }
  return convertNodeTypes[type] || "convertUnknownTypeNode";
}

/**
 * Checks whether has raws
 */
function hasRaws(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- check to prop
  node: any,
): node is { raws: { spaces: { after?: string; before?: string } } } {
  return node.raws != null;
}
