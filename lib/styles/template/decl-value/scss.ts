import type { Interpolation } from "../interpolation"
import { processValue } from "../scss/util"

/**
 * Returns the template elements that the given decl value.
 */
export default function (text: string): (Interpolation | string)[] {
    return processValue(text)
}
