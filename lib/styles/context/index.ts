import {
  createStyleContexts,
  type StyleContext,
  isValidStyleContext,
  type ValidStyleContext,
  type InvalidStyleContext,
} from "./style/index.ts";
import type {
  CommentDirectives,
  CommentDirectivesReporter,
} from "./comment-directive/index.ts";
import {
  createCommentDirectivesReporter,
  createCommentDirectives,
} from "./comment-directive/index.ts";
import type { RuleContext } from "../../types.ts";
import type { AST } from "vue-eslint-parser";
import type { VueComponentContext } from "./vue-components/index.ts";
import { createVueComponentContext } from "./vue-components/index.ts";

type CacheValue = {
  styles?: StyleContext[];
  comment?: CommentDirectives;
  vueComponent?: VueComponentContext | null;
};
/**
 * @type {WeakMap<Program, CacheValue>}
 */
const CACHE = new WeakMap<AST.ESLintProgram, CacheValue>();

/**
 * Gets the cache.
 */
function getCache(context: RuleContext): CacheValue {
  const sourceCode = context.sourceCode;
  const { ast } = sourceCode;
  if (CACHE.has(ast)) {
    return CACHE.get(ast) as CacheValue;
  }
  const cache = {};
  CACHE.set(ast, cache);
  return cache;
}

/**
 * Gets the style contexts from given rule context.
 * @param {RuleContext} context ESLint rule context
 * @returns {StyleContext[]} the style contexts
 */
export function getStyleContexts(context: RuleContext): StyleContext[] {
  const cache = getCache(context);
  if (cache.styles) {
    return cache.styles;
  }
  return (cache.styles = createStyleContexts(context));
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
  );
}

/**
 * Gets the Vue component context from given rule context.
 * @param {RuleContext} context ESLint rule context
 * @returns {VueComponentContext} the Vue component context
 */
export function getVueComponentContext(
  context: RuleContext,
): VueComponentContext | null {
  const cache = getCache(context);
  if (cache.vueComponent) {
    return cache.vueComponent;
  }
  return (cache.vueComponent = createVueComponentContext(context));
}
export { isValidStyleContext };
export type {
  StyleContext,
  ValidStyleContext,
  InvalidStyleContext,
  CommentDirectivesReporter,
  VueComponentContext,
};

/**
 * Gets the comment directive context from given rule context.
 * @param {RuleContext} context ESLint rule context
 * @returns {CommentDirectivesReporter} the comment directives
 */
function getCommentDirectives(context: RuleContext): CommentDirectives {
  const cache = getCache(context);
  if (cache.comment) {
    return cache.comment;
  }
  return (cache.comment = createCommentDirectives(getStyleContexts(context)));
}
