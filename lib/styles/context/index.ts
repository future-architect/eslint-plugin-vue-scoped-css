import {
    createStyleContexts,
    StyleContext,
    ValidStyleContext,
    InvalidStyleContext,
} from "./style"
import {
    CommentDirectivesReporter,
    createCommentDirectivesReporter,
    CommentDirectives,
    createCommentDirectives,
} from "./comment-directive"
import type { RuleContext } from "../../types"
import type { AST } from "vue-eslint-parser"
import {
    VueComponentContext,
    createVueComponentContext,
} from "./vue-components"

type CacheValue = {
    styles?: StyleContext[]
    comment?: CommentDirectives
    vueComponent?: VueComponentContext | null
}
/**
 * @type {WeakMap<Program, CacheValue>}
 */
const CACHE = new WeakMap<AST.ESLintProgram, CacheValue>()

/**
 * Gets the cache.
 */
function getCache(context: RuleContext): CacheValue {
    const sourceCode = context.getSourceCode()
    const { ast } = sourceCode
    if (CACHE.has(ast)) {
        return CACHE.get(ast) as CacheValue
    }
    const cache = {}
    CACHE.set(ast, cache)
    return cache
}

/**
 * Gets the style contexts from given rule context.
 * @param {RuleContext} context ESLint rule context
 * @returns {StyleContext[]} the style contexts
 */
export function getStyleContexts(context: RuleContext): StyleContext[] {
    const cache = getCache(context)
    if (cache.styles) {
        return cache.styles
    }
    return (cache.styles = createStyleContexts(context))
}
/**
 * Gets the comment directive reporter from given rule context.
 * @param {RuleContext} context ESLint rule context
 * @returns {CommentDirectivesReporter} the comment directives
 */
export function getCommentDirectivesReporter(
    context: RuleContext,
): CommentDirectivesReporter {
    return createCommentDirectivesReporter(
        context,
        getCommentDirectives(context),
    )
}

/**
 * Gets the Vue component context from given rule context.
 * @param {RuleContext} context ESLint rule context
 * @returns {VueComponentContext} the Vue component context
 */
export function getVueComponentContext(
    context: RuleContext,
): VueComponentContext | null {
    const cache = getCache(context)
    if (cache.vueComponent) {
        return cache.vueComponent
    }
    return (cache.vueComponent = createVueComponentContext(context))
}
export {
    StyleContext,
    ValidStyleContext,
    InvalidStyleContext,
    CommentDirectivesReporter,
    VueComponentContext,
}

/**
 * Gets the comment directive context from given rule context.
 * @param {RuleContext} context ESLint rule context
 * @returns {CommentDirectivesReporter} the comment directives
 */
function getCommentDirectives(context: RuleContext): CommentDirectives {
    const cache = getCache(context)
    if (cache.comment) {
        return cache.comment
    }
    return (cache.comment = createCommentDirectives(getStyleContexts(context)))
}
