import type { Interpolation } from "../interpolation.ts";
import { processText } from "../scss/util.ts";

/**
 * Returns the template elements that the given atrule params.
 */
export default function (text: string): (Interpolation | string)[] {
  return processText(text);
}
