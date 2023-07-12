import type {
  VCSSIDSelector,
  VCSSTypeSelector,
  VCSSClassSelector,
} from "../../ast";

/**
 * Returns the template elements that the given selector node define.
 */
export default function (
  node: VCSSIDSelector | VCSSClassSelector | VCSSTypeSelector,
): string[] {
  return [node.value];
}
