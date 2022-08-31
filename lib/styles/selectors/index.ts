import type { ValidStyleContext } from "../context";
import type { ResolvedSelectors } from "./resolver/css-selector-resolver";
import {
  CSSSelectorResolver,
  ResolvedSelector,
} from "./resolver/css-selector-resolver";
import { SCSSSelectorResolver } from "./resolver/scss-selector-resolver";
import { StylusSelectorResolver } from "./resolver/stylus-selector-resolver";
import { isSupportedStyleLang } from "../utils";

const RESOLVERS = {
  scss: SCSSSelectorResolver,
  css: CSSSelectorResolver,
  stylus: StylusSelectorResolver,
};

/**
 * Get the selector that resolved the nesting.
 * @param {StyleContext} style The style context
 * @returns {ResolvedSelectors[]} the selector that resolved the nesting.
 */
export function getResolvedSelectors(
  style: ValidStyleContext
): ResolvedSelector[] {
  const lang = style.lang;
  // eslint-disable-next-line @typescript-eslint/naming-convention -- classes
  const Resolver = isSupportedStyleLang(lang)
    ? RESOLVERS[lang]
    : CSSSelectorResolver;
  return extractSelectors(new Resolver().resolveSelectors(style.cssNode));
}

export { ResolvedSelector };

/**
 * Extracts the selectors from the given resolved selectors.
 */
function extractSelectors(
  resolvedSelectorsList: ResolvedSelectors[]
): ResolvedSelector[] {
  const result: ResolvedSelector[] = [];
  for (const resolvedSelectors of resolvedSelectorsList) {
    result.push(...resolvedSelectors.selectors);
    result.push(...extractSelectors(resolvedSelectors.children));
  }

  return result;
}
