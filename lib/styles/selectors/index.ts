import { StyleContext } from "../context"

import {
    CSSSelectorResolver,
    ResolvedSelector,
} from "./resolver/css-selector-resolver"
import { SCSSSelectorResolver } from "./resolver/scss-selector-resolver"
import { isSupportedStyleLang } from "../utils"

const RESOLVERS = {
    scss: SCSSSelectorResolver,
    css: CSSSelectorResolver,
}

/**
 * Get the selector that resolved the nesting.
 * @param {StyleContext} style The style context
 * @returns {ResolvedSelector[]} the selector that resolved the nesting.
 */
export function getResolvedSelectors(style: StyleContext): ResolvedSelector[] {
    if (!style.cssNode) {
        return []
    }
    const lang = style.lang
    const Resolver = isSupportedStyleLang(lang)
        ? RESOLVERS[lang]
        : CSSSelectorResolver
    return new Resolver().resolveSelectors(style.cssNode)
}

export { ResolvedSelector }
