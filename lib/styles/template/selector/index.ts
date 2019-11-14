import getCSSTemplateElements from "./css"
import getSCSSTemplateElements from "./scss"
import { VCSSIDSelector, VCSSTypeSelector, VCSSClassSelector } from "../../ast"
import { Interpolation } from "../interpolation"
import { isSupportedStyleLang } from "../../utils"

const BUILDERS = {
    css: getCSSTemplateElements,
    scss: getSCSSTemplateElements,
}

/**
 * Returns the template elements that the given selector node define.
 */
export default function getSelectorTemplateElements(
    node: VCSSIDSelector | VCSSClassSelector | VCSSTypeSelector,
): (Interpolation | string)[] {
    const templateBuilder = isSupportedStyleLang(node.lang)
        ? BUILDERS[node.lang]
        : getCSSTemplateElements
    return templateBuilder(node)
}
