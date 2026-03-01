import getCSSTemplateElements from "./css.ts";
import getSCSSTemplateElements from "./scss.ts";
import getStylusTemplateElements from "./stylus.ts";
import type { Interpolation } from "../interpolation.ts";
import { isSupportedStyleLang } from "../../utils";

const BUILDERS = {
  css: getCSSTemplateElements,
  scss: getSCSSTemplateElements,
  stylus: getStylusTemplateElements,
};

/**
 * Returns the template elements that the given decl value.
 */
export default function getDeclValueTemplateElements(
  text: string,
  lang: string,
): (Interpolation | string)[] {
  const templateBuilder = isSupportedStyleLang(lang)
    ? BUILDERS[lang]
    : getCSSTemplateElements;
  return templateBuilder(text.trim());
}
