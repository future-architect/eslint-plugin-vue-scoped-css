import { createRequire } from "node:module";
import type * as postcss from "postcss";
import type * as postcssScssType from "postcss-scss";
import { CSSParser } from "./css-parser.ts";
import type { VCSSContainerNode, VCSSNode } from "../ast.ts";
import { VCSSInlineComment } from "../ast.ts";
import type {
  SourceLocation,
  PostCSSComment,
  PostCSSNode,
} from "../../types.ts";
import { SCSSSelectorParser } from "./selector/scss-selector-parser.ts";

const _require = createRequire(import.meta.url);
let _postcssScss: typeof postcssScssType | null = null;
try {
  _postcssScss = _require("postcss-scss") as typeof postcssScssType;
} catch (e) {
  if ((e as NodeJS.ErrnoException).code !== "MODULE_NOT_FOUND") {
    throw e;
  }
  // postcss-scss is an optional peer dependency
}
/**
 * SCSS Parser
 */
export class SCSSParser extends CSSParser {
  protected parseInternal(css: string): postcss.Root {
    if (!_postcssScss) {
      throw new Error(
        "postcss-scss is required to parse SCSS. Please install it: npm install --save-dev postcss-scss",
      );
    }
    return _postcssScss.parse(css) as postcss.Root;
  }

  protected createSelectorParser(): SCSSSelectorParser {
    return new SCSSSelectorParser(this.sourceCode, this.commentContainer);
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
