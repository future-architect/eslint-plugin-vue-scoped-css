import {
    PostCSSSPRootNode,
    PostCSSSPNode,
    LineAndColumnData,
    SourceLocation,
    PostCSSSPCommentNode,
} from "../../../types"
import { CSSSelectorParser } from "./css-selector-parser"
import selectorParser from "postcss-selector-parser"
import lodash from "lodash"
import { isPostCSSSPContainer } from "../utils"
import { VCSSSelectorContainerNode, VCSSInlineComment } from "../../ast"

class RemapContext {
    private mappers: { org: [number, number]; new: [number, number] }[] = []
    private orgIndex = 0
    private newIndex = 0
    private batchLengthOrg = 0
    private batchLengthNew = 0

    public applyEq(length: number) {
        if (length <= 0) {
            return
        }
        this.flush()
        const newEnd = this.newIndex + length
        const orgEnd = this.orgIndex + length
        this.addMap([this.orgIndex, orgEnd], [this.newIndex, newEnd])
        this.newIndex = newEnd
        this.orgIndex = orgEnd
    }

    public applyIns(length: number) {
        this.batchLengthNew += length
    }

    public applyDel(length: number) {
        this.batchLengthOrg += length
    }

    public flush() {
        if (this.batchLengthNew || this.batchLengthOrg) {
            const newEnd = this.newIndex + this.batchLengthNew
            const orgEnd = this.orgIndex + this.batchLengthOrg
            this.addMap([this.orgIndex, orgEnd], [this.newIndex, newEnd])
            this.newIndex = newEnd
            this.orgIndex = orgEnd
            this.batchLengthOrg = 0
            this.batchLengthNew = 0
        }
    }
    private addMap(orgRange: [number, number], newRange: [number, number]) {
        if (orgRange[0] === newRange[0] && orgRange[1] === newRange[1]) {
            return
        }
        this.mappers.unshift({
            org: orgRange,
            new: newRange,
        })
    }

    public hasMapping() {
        return this.mappers.length > 1
    }

    public remapIndex(index: number) {
        for (const mapper of this.mappers) {
            if (mapper.new[0] <= index && index < mapper.new[1]) {
                const offset = index - mapper.new[0]
                return Math.min(mapper.org[0] + offset, mapper.org[1] - 1)
            }
            if (index === mapper.new[1]) {
                return mapper.org[1]
            }
        }
        return index
    }
}

class SourceCode {
    private text: string
    private lineStartIndices: number[]
    /**
     * constructor
     */
    public constructor(code: string) {
        const lineStartIndices = [0]

        let match = undefined
        const lineEndingPattern = /\r\n|[\r\n\u2028\u2029]/gu
        while ((match = lineEndingPattern.exec(code))) {
            lineStartIndices.push(match.index + match[0].length)
        }
        this.text = code
        this.lineStartIndices = lineStartIndices
    }

    /**
     * Converts a source text index into a (line, column) pair.
     * @param {number} index The index of a character in a file
     * @returns {object} A {line, column} location object with a 0-indexed column
     */
    public getLocFromIndex(index: number): LineAndColumnData {
        const code = this.text
        const lineStartIndices = this.lineStartIndices
        if (index === code.length) {
            return {
                line: lineStartIndices.length,
                column: index - lineStartIndices[lineStartIndices.length - 1],
            }
        }
        const lineNumber = lodash.sortedLastIndex(lineStartIndices, index)

        return {
            line: lineNumber,
            column: index - lineStartIndices[lineNumber - 1],
        }
    }

    /**
     * Converts a (line, column) pair into a range index.
     * @param {Object} loc A line/column location
     * @param {number} loc.line The line number of the location (1-indexed)
     * @param {number} loc.column The column number of the location (0-indexed)
     * @returns {number} The range index of the location in the file.
     * @public
     */
    public getIndexFromLoc(loc: LineAndColumnData): number {
        const lineStartIndices = this.lineStartIndices
        const lineStartIndex = lineStartIndices[loc.line - 1]
        const positionIndex = lineStartIndex + loc.column

        return positionIndex
    }
}

interface ReplaceInfo {
    start: number
    original: string
    replace: string
}

export class SCSSSelectorParser extends CSSSelectorParser {
    // eslint-disable-next-line class-methods-use-this
    protected parseInternal(selector: string): PostCSSSPRootNode {
        const {
            cssSelector,
            remapContext,
            interpolations,
            inlineComments,
        } = replaceSelectorInterpolationAndInlineComments(selector)
        const result: PostCSSSPRootNode = selectorParser().astSync(cssSelector)
        if (!interpolations.length && !inlineComments.length) {
            return result
        }
        const scssSourceCode = new SourceCode(selector)
        const cssSourceCode = new SourceCode(cssSelector)
        return restoreInterpolationAndInlineComments(result, {
            remapContext,
            interpolations,
            inlineComments,
            scssSourceCode,
            cssSourceCode,
        })
    }

    protected parseCommentsInternal(selector: string): PostCSSSPRootNode {
        return this.parseInternal(selector)
    }

    /**
     * Convert comment Node
     * @param  {object} node  The node.
     * @param  {SourceLocation} loc  The location.
     * @param  {number} start  The index of start.
     * @param  {number} end  The index of end.
     * @param  {Node} parent  The parent node.
     * @returns {null}
     */
    protected convertCommentNode(
        node: PostCSSSPCommentNode,
        loc: SourceLocation,
        start: number,
        end: number,
        parent: VCSSSelectorContainerNode,
    ): null {
        if (node.value.startsWith("//")) {
            // inline comment

            const text = node.value
                .replace(/^\s*\/\//u, "")
                .replace(/\r?\n\s*$/u, "")
            this.commentContainer.push(
                new VCSSInlineComment(node, text, loc, start, end, {
                    parent,
                }),
            )
            return null
        }
        return super.convertCommentNode(node, loc, start, end, parent)
    }
}

/**
 * Replace selector interpolation and inline comments
 */
function replaceSelectorInterpolationAndInlineComments(
    selector: string,
): {
    cssSelector: string
    remapContext: RemapContext
    interpolations: ReplaceInfo[]
    inlineComments: ReplaceInfo[]
} {
    const remapContext = new RemapContext()
    const interpolations = new Map<string, ReplaceInfo>()
    const inlineComments = new Map<string, ReplaceInfo>()
    const reInterpolationOrComment = /#\{([\s\S]+?)\}|\/\*([\s\S]+?)\*\/|\/\/([\s\S]+?)\n/gu
    let res = null
    let cssSelector = ""
    let start = 0
    while ((res = reInterpolationOrComment.exec(`${selector}\n`))) {
        const text = res[0]
        if (text.startsWith("/*")) {
            // block comment
            continue
        }
        const plain = selector.slice(start, res.index)
        let replaceString
        if (text.startsWith("//")) {
            // inline comment
            let block = `/*${randomStr()}*/`
            while (inlineComments.has(block) || selector.includes(block)) {
                block = `/*${randomStr()}*/`
            }
            inlineComments.set(block, {
                start: res.index,
                original: text,
                replace: block,
            })
            replaceString = block
        } else {
            // interpolate
            let interpolate = `_${randomStr()}_`
            while (
                interpolations.has(interpolate) ||
                selector.includes(interpolate)
            ) {
                interpolate = `_${randomStr()}_`
            }

            interpolations.set(interpolate, {
                start: res.index,
                original: text,
                replace: interpolate,
            })
            replaceString = interpolate
        }

        cssSelector += plain
        cssSelector += replaceString

        remapContext.applyEq(plain.length)
        remapContext.applyIns(replaceString.length)
        remapContext.applyDel(res[0].length)

        start = reInterpolationOrComment.lastIndex
    }
    const plain = selector.slice(start)
    cssSelector += plain
    remapContext.applyEq(plain.length)
    remapContext.flush()
    return {
        cssSelector,
        remapContext,
        interpolations: [...interpolations.values()],
        inlineComments: [...inlineComments.values()],
    }
}

/**
 * Restore each node's the location and the replaced interpolation and replaced inline comments.
 */
function restoreInterpolationAndInlineComments<T extends PostCSSSPNode>(
    node: T,
    options: {
        remapContext: RemapContext
        interpolations: ReplaceInfo[]
        inlineComments: ReplaceInfo[]
        scssSourceCode: SourceCode
        cssSourceCode: SourceCode
    },
): T {
    const {
        remapContext,
        interpolations,
        inlineComments,
        scssSourceCode,
        cssSourceCode,
    } = options

    if (node.source) {
        if (node.source.start) {
            const cssLoc = node.source.start
            const index = cssSourceCode.getIndexFromLoc({
                line: cssLoc.line,
                column: cssLoc.column - 1,
            })
            const scssIndex = remapContext.remapIndex(index)
            const scssLoc = scssSourceCode.getLocFromIndex(scssIndex)
            scssLoc.column++
            node.source.start = scssLoc
        }
        if (node.source.end) {
            const cssLoc = node.source.end
            const index = cssSourceCode.getIndexFromLoc({
                line: cssLoc.line,
                column: cssLoc.column,
            })
            const scssIndex = remapContext.remapIndex(index)
            node.source.end = scssSourceCode.getLocFromIndex(scssIndex)
        }
        while (restoreInterpolations(node, interpolations)) {
            // loop
        }
        while (restoreComments(node, inlineComments)) {
            // loop
        }
    }
    if (isPostCSSSPContainer(node)) {
        for (const n of node.nodes) {
            restoreInterpolationAndInlineComments(n, options)
        }
    }
    return node
}

/**
 * Restore interpolation for given node
 */
function restoreInterpolations(
    node: PostCSSSPNode,
    interpolations: ReplaceInfo[],
): boolean {
    if (!interpolations.length) {
        return false
    }
    const targetProperties = []
    if (
        node.type === "tag" ||
        node.type === "class" ||
        node.type === "id" ||
        node.type === "combinator" ||
        node.type === "pseudo" ||
        node.type === "string"
    ) {
        targetProperties.push("value")
    } else if (node.type === "attribute") {
        targetProperties.push("attribute")
        targetProperties.push("value")
    }

    for (const prop of targetProperties) {
        for (let index = 0; index < interpolations.length; index++) {
            const interpolation = interpolations[index]
            if (restoreReplaceNodeProp(node, prop, interpolation)) {
                interpolations.splice(index, 1)
                return true
            }
        }
    }

    return false
}

/**
 * Restore inline comments for given node
 */
function restoreComments(node: PostCSSSPNode, inlineComments: ReplaceInfo[]) {
    if (!inlineComments.length) {
        return false
    }
    const targetProperties = []
    if (node.type === "comment") {
        targetProperties.push("value")
    }
    if (hasRaws(node)) {
        targetProperties.push("raws.spaces.after")
        targetProperties.push("raws.spaces.before")
    }

    for (const prop of targetProperties) {
        for (let index = 0; index < inlineComments.length; index++) {
            const comment = inlineComments[index]
            if (restoreReplaceNodeProp(node, prop, comment)) {
                inlineComments.splice(index, 1)
                return true
            }
        }
    }
    return false
}

/**
 * Restore replaced text
 */
function restoreReplaceNodeProp(
    node: PostCSSSPNode,
    prop: string,
    replaceInfo: ReplaceInfo,
): boolean {
    const text = `${lodash.get(node, prop, "") || ""}`
    if (text.includes(replaceInfo.replace)) {
        const newText = text.replace(replaceInfo.replace, replaceInfo.original)
        lodash.set(node, prop, newText)
        if (!prop.startsWith("raws")) {
            lodash.set(node, `raws.${prop}`, newText)
        }
        return true
    }
    return false
}

/**
 * @return Returns the random string.
 */
function randomStr(): string {
    const S = "abcdefghijklmnopqrstuvwxyz0123456789"
    const N = 16
    return Array.from(Array(N))
        .map(() => S[Math.floor(Math.random() * S.length)])
        .join("")
}

/**
 * Checks whether has raws
 */
function hasRaws(
    node: any,
): node is { raws: { spaces: { after?: string; before?: string } } } {
    return node.raws != null
}
