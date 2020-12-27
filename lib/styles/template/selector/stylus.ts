import type {
    VCSSIDSelector,
    VCSSClassSelector,
    VCSSTypeSelector,
} from "../../ast"
import type { Interpolation } from "../interpolation"
import { processText } from "../stylus/util"

/**
 * Returns the template elements that the given selector node define.
 */
export default function (
    node: VCSSIDSelector | VCSSClassSelector | VCSSTypeSelector,
): (Interpolation | string)[] {
    return processText(node.value)
}
