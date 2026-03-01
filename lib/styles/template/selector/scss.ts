import type {
  VCSSIDSelector,
  VCSSClassSelector,
  VCSSTypeSelector,
} from "../../ast.ts";
import type { Interpolation } from "../interpolation.ts";
import { processText } from "../scss/util.ts";

/**
 * Returns the template elements that the given selector node define.
 */
export default function (
  node: VCSSIDSelector | VCSSClassSelector | VCSSTypeSelector,
): (Interpolation | string)[] {
  return processText(node.value);
}
