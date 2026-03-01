import getCSSTemplateElements from "./css.ts";
import getSCSSTemplateElements from "./scss.ts";
import getStylusTemplateElements from "./stylus.ts";
import type {
  VCSSIDSelector,
  VCSSTypeSelector,
  VCSSClassSelector,
} from "../../ast.ts";
import type { Interpolation } from "../interpolation.ts";
import { isSupportedStyleLang } from "../../utils";

const BUILDERS = {
  css: getCSSTemplateElements,
  scss: getSCSSTemplateElements,
  stylus: getStylusTemplateElements,
};

/**
 * Returns the template elements that the given selector node define.
 */
export default function getSelectorTemplateElements(
  node: VCSSIDSelector | VCSSClassSelector | VCSSTypeSelector,
): (Interpolation | string)[] {
  const templateBuilder = isSupportedStyleLang(node.lang)
    ? BUILDERS[node.lang]
    : getCSSTemplateElements;
  return templateBuilder(node);
}
