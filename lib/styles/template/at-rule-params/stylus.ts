import type { Interpolation } from "../interpolation.ts";
import { processText } from "../stylus/util.ts";

/**
 * Returns the template elements that the given atrule params.
 */
export default function (text: string): (Interpolation | string)[] {
  return processText(text);
}
