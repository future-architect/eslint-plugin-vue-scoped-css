import getCSSTemplateElements from "./css.ts";
import getSCSSTemplateElements from "./scss.ts";
import getStylusTemplateElements from "./stylus.ts";
import type { Interpolation } from "../interpolation.ts";
import { isSupportedStyleLang } from "../../utils/index.ts";

const BUILDERS = {
  css: getCSSTemplateElements,
  scss: getSCSSTemplateElements,
  stylus: getStylusTemplateElements,
};

/**
 * Returns the template elements that the given atrule params.
 */
export default function getAtRuleParamsTemplateElements(
  text: string,
  lang: string,
): (Interpolation | string)[] {
  const templateBuilder = isSupportedStyleLang(lang)
    ? BUILDERS[lang]
    : getCSSTemplateElements;
  return templateBuilder(text.trim());
}
