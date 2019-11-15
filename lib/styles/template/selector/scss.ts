import { VCSSIDSelector, VCSSClassSelector, VCSSTypeSelector } from "../../ast"
import { Interpolation } from "../interpolation"
import { processText } from "../scss/util"

/**
 * Returns the template elements that the given selector node define.
 */
export default function(
    node: VCSSIDSelector | VCSSClassSelector | VCSSTypeSelector,
): (Interpolation | string)[] {
    return processText(node.value)
}
