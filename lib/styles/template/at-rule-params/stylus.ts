import type { Interpolation } from "../interpolation"
import { processText } from "../stylus/util"

/**
 * Returns the template elements that the given atrule params.
 */
export default function (text: string): (Interpolation | string)[] {
    return processText(text)
}
