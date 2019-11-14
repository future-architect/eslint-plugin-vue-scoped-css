import { VCSSIDSelector, VCSSClassSelector, VCSSTypeSelector } from "../../ast"
import { Interpolation } from "../interpolation"

/**
 * Returns the template elements that the given selector node define.
 */
export default function(
    node: VCSSIDSelector | VCSSClassSelector | VCSSTypeSelector,
): (Interpolation | string)[] {
    const elements = []
    const value = node.value
    let start = 0
    const reg = /#\{([\s\S]*?)\}/gu
    let re = null
    while ((re = reg.exec(value))) {
        elements.push(value.slice(start, re.index))
        elements.push(new Interpolation(value.slice(re.index, reg.lastIndex)))
        start = reg.lastIndex
    }
    elements.push(value.slice(start))

    return elements
}
