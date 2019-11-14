import {
    getStyleContexts,
    getCommentDirectivesReporter,
    StyleContext,
    CommentDirectivesReporter,
} from "./context"

export {
    StyleContext,
    CommentDirectivesReporter,
    /**
     * Gets the style contexts
     * @param {RuleContext} context ESLint rule context
     * @returns {StyleContext[]} the style contexts
     */
    getStyleContexts,
    /**
     * Gets the comment directive reporter
     * @param {RuleContext} context ESLint rule context
     * @returns {CommentDirectivesReporter} the comment directives
     */
    getCommentDirectivesReporter,
}
