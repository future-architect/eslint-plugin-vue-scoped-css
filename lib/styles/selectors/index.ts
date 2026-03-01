import type { ValidStyleContext } from "../context";
import type { ResolvedSelectors } from "./resolver/css-selector-resolver.ts";
import {
  CSSSelectorResolver,
  ResolvedSelector,
} from "./resolver/css-selector-resolver.ts";
import { SCSSSelectorResolver } from "./resolver/scss-selector-resolver.ts";
import { StylusSelectorResolver } from "./resolver/stylus-selector-resolver.ts";
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
  style: ValidStyleContext,
): ResolvedSelector[] {
  const lang = style.lang;

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
  resolvedSelectorsList: ResolvedSelectors[],
): ResolvedSelector[] {
  const result: ResolvedSelector[] = [];
  for (const resolvedSelectors of resolvedSelectorsList) {
    result.push(...resolvedSelectors.selectors);
    result.push(...extractSelectors(resolvedSelectors.children));
  }

  return result;
}
