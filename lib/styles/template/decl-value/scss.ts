import type { Interpolation } from "../interpolation.ts";
import { processValue } from "../scss/util.ts";

/**
 * Returns the template elements that the given decl value.
 */
export default function (text: string): (Interpolation | string)[] {
  return processValue(text);
}
