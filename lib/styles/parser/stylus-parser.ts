import type * as postcss from "postcss";
import type * as postcssStylType from "postcss-styl";
import { loadOptionalDep } from "./load-optional-dep.ts";
import { CSSParser } from "./css-parser.ts";
import type { VCSSContainerNode, VCSSNode } from "../ast.ts";
import { VCSSInlineComment } from "../ast.ts";
import type {
  SourceLocation,
  PostCSSComment,
  PostCSSNode,
  SourceCode,
} from "../../types.ts";
import { StylusSelectorParser } from "./selector/stylus-selector-parser.ts";

/**
 * Stylus Parser
 */
export class StylusParser extends CSSParser {
  readonly #postcssStyl: typeof postcssStylType | null;

  public constructor(sourceCode: SourceCode, lang: string) {
    super(sourceCode, lang);
    this.#postcssStyl = loadOptionalDep<typeof postcssStylType>("postcss-styl");
  }

  protected parseInternal(css: string): postcss.Root {
    if (!this.#postcssStyl) {
      throw new Error(
        "postcss-styl is required to parse Stylus. Please install it: npm install --save-dev postcss-styl",
      );
    }
    return this.#postcssStyl.parse(css) as postcss.Root;
  }

  protected createSelectorParser(): StylusSelectorParser {
    return new StylusSelectorParser(this.sourceCode, this.commentContainer);
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
      );
      return null;
    }
    return super.convertCommentNode(node, loc, start, end, parent);
  }

  protected getRaw<N extends PostCSSNode, K extends keyof N["raws"] & string>(
    node: N,
    keyName: K,
  ): N["raws"][K] {
    if (keyName === "between" || keyName === "before" || keyName === "after") {
      const stylus = super.getRaw(
        node as never,
        `stylus${keyName[0].toUpperCase()}${keyName.slice(1)}`,
      );
      if (stylus) {
        return stylus;
      }
    }
    const raw = super.getRaw(node, keyName);
    if (raw != null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- check stylus
      const stylus = (raw as any).stylus;
      if (stylus != null) {
        return {
          raw: stylus,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- stylus
          value: (raw as any).value,
        } as never;
      }
    }

    return raw;
  }
}
