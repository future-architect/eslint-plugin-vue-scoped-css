import getCSSTemplateElements from "./css"
import getSCSSTemplateElements from "./scss"
import { Interpolation } from "../interpolation"
import { isSupportedStyleLang } from "../../utils"

const BUILDERS = {
    css: getCSSTemplateElements,
    scss: getSCSSTemplateElements,
}

/**
 * Returns the template elements that the given atrule params.
 */
export default function getAtRuleParamsTemplateElements(
    text: string,
    lang: string,
): (Interpolation | string)[] {
    const templateBuilder = isSupportedStyleLang(lang)
        ? BUILDERS[lang]
        : getCSSTemplateElements
    return templateBuilder(text.trim())
}
