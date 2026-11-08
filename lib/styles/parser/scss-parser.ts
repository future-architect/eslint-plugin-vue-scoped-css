import type * as postcss from "postcss";
import type * as postcssScssType from "postcss-scss";
import { loadOptionalDep } from "./load-optional-dep.ts";
import { CSSParser } from "./css-parser.ts";
import type { VCSSContainerNode, VCSSNode } from "../ast.ts";
import { VCSSDeclarationProperty, VCSSInlineComment } from "../ast.ts";
import type {
  SourceLocation,
  PostCSSComment,
  PostCSSNode,
  PostCSSRule,
  SourceCode,
} from "../../types.ts";
import { SCSSSelectorParser } from "./selector/scss-selector-parser.ts";

/**
 * SCSS Parser
 */
export class SCSSParser extends CSSParser {
  readonly #postcssScss: typeof postcssScssType | null;

  public constructor(sourceCode: SourceCode, lang: string) {
    super(sourceCode, lang);
    this.#postcssScss = loadOptionalDep<typeof postcssScssType>("postcss-scss");
  }

  protected parseInternal(css: string): postcss.Root {
    if (!this.#postcssScss) {
      throw new Error(
        "postcss-scss is required to parse SCSS. Please install it: npm install --save-dev postcss-scss",
      );
    }
    return this.#postcssScss.parse(css) as postcss.Root;
  }

  protected createSelectorParser(): SCSSSelectorParser {
    return new SCSSSelectorParser(this.sourceCode, this.commentContainer);
  }

  /**
   * Convert rule Node
   * @param  {object} node  The node.
   * @param  {SourceLocation} loc  The location.
   * @param  {number} start  The index of start.
   * @param  {number} end  The index of end.
   * @param  {Node} parent  The parent node.
   * @returns {VCSSStyleRule | VCSSDeclarationProperty}
   */
  protected convertRuleNode(
    node: PostCSSRule,
    loc: SourceLocation,
    start: number,
    end: number,
    parent: VCSSContainerNode,
  ): VCSSNode | null {
    const selector = node.selector.trimEnd();
    if (selector.endsWith(":")) {
      // Nested properties without a value are parsed as rules by postcss-scss.
      // e.g. `border: { style: solid; }`
      return new VCSSDeclarationProperty(node as never, loc, start, end, {
        parent,
        property: selector.slice(0, -1).trimEnd(),
        value: "",
      });
    }
    return super.convertRuleNode(node, loc, start, end, parent);
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
    const raw = super.getRaw(node, keyName);
    if (raw != null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- check scss node
      const scss = (raw as any).scss;
      if (scss != null) {
        return {
          raw: scss,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- scss node
          value: (raw as any).value,
        } as never;
      }
    }

    return raw;
  }
}
