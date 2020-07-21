import type {
    LineAndColumnData,
    ReportDescriptor,
    RuleContext,
    SourceLocation,
    ReportDescriptorSourceLocation,
} from "../../../types"
import type { StyleContext } from "../style"
import type { VCSSCommentNode } from "../../ast"

const COMMENT_DIRECTIVE_B = /^\s*(eslint-(?:en|dis)able)(?:\s+(\S|\S[\s\S]*\S))?\s*$/u
const COMMENT_DIRECTIVE_L = /^\s*(eslint-disable(?:-next)?-line)(?:\s+(\S|\S[\s\S]*\S))?\s*$/u

type ParsingResult = { type: string; rules: string[] }
type BlockData = { loc: LineAndColumnData; disable: boolean }

/**
 * Parse a given comment.
 * @param {RegExp} pattern The RegExp pattern to parse.
 * @param {string} comment The comment value to parse.
 * @returns {({type:string,rules:string[]})|null} The parsing result.
 */
function parse(pattern: RegExp, comment: string): ParsingResult | null {
    const match = pattern.exec(comment)
    if (match == null) {
        return null
    }

    const type = match[1]
    const rules = (match[2] || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)

    return { type, rules }
}

/**
 * Enable rules.
 * @param {CommentDirectives} commentDirectives The comment directives context.
 * @param {{line:number,column:number}} loc The location information to enable.
 * @param {string[]} rules The rule IDs to enable.
 * @returns {void}
 */
function enable(
    commentDirectives: CommentDirectives,
    loc: LineAndColumnData,
    rules: string[],
) {
    if (rules.length === 0) {
        commentDirectives.enableAll(loc)
    } else {
        commentDirectives.enableRules(loc, rules)
    }
}

/**
 * Disable rules.
 * @param {CommentDirectives} commentDirectives The comment directives context.
 * @param {{line:number,column:number}} loc The location information to disable.
 * @param {string[]} rules The rule IDs to disable.
 * @returns {void}
 */
function disable(
    commentDirectives: CommentDirectives,
    loc: LineAndColumnData,
    rules: string[],
) {
    if (rules.length === 0) {
        commentDirectives.disableAll(loc)
    } else {
        commentDirectives.disableRules(loc, rules)
    }
}

/**
 * Process a given comment token.
 * If the comment is `eslint-disable` or `eslint-enable` then it reports the comment.
 * @param {CommentDirectives} commentDirectives The comment directives context.
 * @param {Token} comment The comment token to process.
 * @returns {void}
 */
function processBlock(
    commentDirectives: CommentDirectives,
    comment: VCSSCommentNode,
) {
    const parsed = parse(COMMENT_DIRECTIVE_B, comment.text)
    if (parsed != null) {
        if (parsed.type === "eslint-disable") {
            disable(commentDirectives, comment.loc.start, parsed.rules)
        } else {
            enable(commentDirectives, comment.loc.start, parsed.rules)
        }
    }
}

/**
 * Process a given comment token.
 * If the comment is `eslint-disable-line` or `eslint-disable-next-line` then it reports the comment.
 * @param {CommentDirectives} commentDirectives The comment directives context.
 * @param {Token} comment The comment token to process.
 * @returns {void}
 */
function processLine(
    commentDirectives: CommentDirectives,
    comment: VCSSCommentNode,
) {
    const parsed = parse(COMMENT_DIRECTIVE_L, comment.text)
    if (parsed != null && comment.loc.start.line === comment.loc.end.line) {
        const line =
            comment.loc.start.line +
            (parsed.type === "eslint-disable-line" ? 0 : 1)
        const column = -1
        if (!parsed.rules.length) {
            commentDirectives.disableLineAll({ line, column })
        } else {
            commentDirectives.disableLineRules({ line, column }, parsed.rules)
        }
    }
}

export class CommentDirectives {
    private _disableLines: {
        [key: number]: {
            all: boolean
            [key: string]: boolean
        }
    }
    private _disableBlocks: { [key: string]: BlockData[] }
    /**
     * constructor
     * @param {StyleContext[]} styles The styles
     * @returns {void}
     */
    public constructor(styles: StyleContext[]) {
        this._disableLines = {}
        this._disableBlocks = {}

        for (const style of styles) {
            const cssNode = style.cssNode
            if (cssNode != null) {
                for (const comment of cssNode.comments) {
                    processBlock(this, comment)
                    processLine(this, comment)
                }
                this.clear(cssNode.loc.end)
            }
        }

        for (const rule of Object.keys(this._disableBlocks)) {
            this._disableBlocks[rule].sort((a, b) => compareLoc(a.loc, b.loc))
        }
    }

    public disableLineAll(loc: LineAndColumnData) {
        const disableLine =
            this._disableLines[loc.line] ||
            (this._disableLines[loc.line] = { all: true })
        disableLine.all = true
    }

    public disableLineRules(loc: LineAndColumnData, rules: string[]) {
        const disableLine =
            this._disableLines[loc.line] ||
            (this._disableLines[loc.line] = { all: false })
        for (const rule of rules) {
            disableLine[rule] = true
        }
    }

    public disableAll(loc: LineAndColumnData) {
        const disableBlock =
            this._disableBlocks.all || (this._disableBlocks.all = [])
        disableBlock.push({ loc, disable: true })
    }

    public disableRules(loc: LineAndColumnData, rules: string[]) {
        for (const rule of rules) {
            const disableBlock =
                this._disableBlocks[rule] || (this._disableBlocks[rule] = [])
            disableBlock.push({ loc, disable: true })
        }
    }

    public enableAll(loc: LineAndColumnData) {
        const disableBlock =
            this._disableBlocks.all || (this._disableBlocks.all = [])
        disableBlock.push({ loc, disable: false })
    }

    public enableRules(loc: LineAndColumnData, rules: string[]) {
        for (const rule of rules) {
            const disableBlock =
                this._disableBlocks[rule] || (this._disableBlocks[rule] = [])
            disableBlock.push({ loc, disable: false })
        }
    }

    public clear(loc: LineAndColumnData) {
        for (const rule of Object.keys(this._disableBlocks)) {
            this._disableBlocks[rule].push({ loc, disable: false })
        }
    }

    /**
     * Chacks if rule is enabled or not
     * @param {string} rule
     * @param {ReportDescriptor} descriptor ESLint report descriptor
     * @returns {boolean} `true` if rule is enabled
     */
    public isEnabled(rule: string, descriptor: ReportDescriptor) {
        const loc = hasSourceLocation(descriptor)
            ? descriptor.loc
            : descriptor.node?.loc
        if (!loc) {
            return false
        }
        const locStart = (loc as SourceLocation).start || loc

        const disableLine = this._disableLines[locStart.line]
        if (disableLine) {
            if (disableLine.all || disableLine[rule]) {
                return false
            }
        }

        for (const ruleId of [rule, "all"]) {
            const disableBlock = this._disableBlocks[ruleId]
            if (disableBlock) {
                let disableState = false
                for (const block of disableBlock) {
                    if (compareLoc(locStart, block.loc) < 0) {
                        break
                    }
                    disableState = block.disable
                }
                if (disableState) {
                    return false
                }
            }
        }

        return true
    }
}

export class CommentDirectivesReporter {
    private context: RuleContext
    private commentDirectives: CommentDirectives
    /**
     * constructor
     * @param {RuleContext} context ESLint rule context
     * @param {CommentDirectives} commentDirectives The comment directives context.
     * @returns {void}
     */
    public constructor(
        context: RuleContext,
        commentDirectives: CommentDirectives,
    ) {
        this.context = context
        this.commentDirectives = commentDirectives
    }

    /**
     * Reports a problem in the code.
     * @param {ReportDescriptor} descriptor ESLint report descriptor
     * @returns {void}
     */
    public report(descriptor: ReportDescriptor) {
        if (this.commentDirectives.isEnabled(this.context.id, descriptor)) {
            this.context.report(descriptor)
        }
    }
}

/**
 * Create the comment directives context
 * @param {RuleContext} context ESLint rule context
 * @param {StyleContext[]} styleContexts The styles
 * @returns {CommentDirectives} the comment directives context
 */
export function createCommentDirectives(
    styleContexts: StyleContext[],
): CommentDirectives {
    return new CommentDirectives(styleContexts)
}

/**
 * Create the comment directive reporter
 * @param {RuleContext} context ESLint rule context
 * @param {CommentDirectives} commentDirectives the comment directives context
 * @returns {CommentDirectivesReporter} the comment directives
 */
export function createCommentDirectivesReporter(
    context: RuleContext,
    commentDirectives: CommentDirectives,
): CommentDirectivesReporter {
    return new CommentDirectivesReporter(context, commentDirectives)
}

/**
 * Compare values
 * @param {*} a The first value
 * @param {*} b The second value
 */
function compare(a: any, b: any) {
    return a === b ? 0 : a > b ? 1 : -1
}

/**
 * Compare locations
 * @param {*} a The first value
 * @param {*} b The second value
 */
function compareLoc(a: LineAndColumnData, b: LineAndColumnData) {
    const lc = compare(a.line, b.line)
    if (lc !== 0) {
        return lc
    }
    return compare(a.column, b.column)
}

/**
 * Checks whether the given descriptor has loc property
 */
function hasSourceLocation(
    descriptor: ReportDescriptor,
): descriptor is ReportDescriptor & ReportDescriptorSourceLocation {
    return (descriptor as ReportDescriptorSourceLocation).loc != null
}
