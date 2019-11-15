// eslint-disable-next-line  @mysticatea/node/no-missing-import
import AST from "vue-eslint-parser/ast"
import postcss from "postcss"
import selectorParser from "postcss-selector-parser"
// eslint-disable-next-line @mysticatea/node/no-extraneous-import
import { ScopeManager } from "eslint-scope"

export { AST }

export type Rule = {
    create(context: RuleContext): { [key: string]: Function }
    meta: {
        docs: {
            description: string
            category: string
            ruleId: string
            ruleName: string
            default?: string
            replacedBy?: string[]
            url: string
        }
        deprecated?: boolean
        fixable?: "code" | "whitespace" | null
        schema: any[]
        messages: { [key: string]: string }
    }
}

export interface VDirectiveKeyV5 extends AST.HasLocation, AST.HasParent {
    type: "VDirectiveKey"
    name: string
    argument: string | null
    modifiers: string[]
    parent: AST.VAttribute
    shorthand: boolean
    raw: {
        name: string
        argument: string | null
        modifiers: string[]
    }
}
export interface VDirectiveKeyV6 extends AST.HasLocation, AST.HasParent {
    type: "VDirectiveKey"
    parent: AST.VAttribute
    name: AST.VIdentifier
    argument: AST.VExpressionContainer | AST.VIdentifier | null
    modifiers: AST.VIdentifier[]
}

export type VDirectiveKey = VDirectiveKeyV5 | VDirectiveKeyV6

export interface TSAsExpression extends AST.HasLocation, AST.HasParent {
    type: "TSAsExpression"
    expression: AST.ESLintExpression
}

export type ASTNode = AST.Node | AST.ESLintLegacySpreadProperty | TSAsExpression

export type LineAndColumnData = AST.Location
export type SourceLocation = AST.LocationRange
export type Range = [number, number]
interface ParserServices {
    /**
     * Get the token store of the template body.
     * @returns The token store of template body.
     */
    // getTemplateBodyTokenStore(): TokenStore

    /**
     * Get the root document fragment.
     * @returns The root document fragment.
     */
    getDocumentFragment?: () => AST.VDocumentFragment | null
}
export interface RuleContext {
    id: string
    getSourceCode: () => SourceCode
    report: (descriptor: ReportDescriptor) => void
    options: any[]
    getFilename: () => string
    parserServices: ParserServices
}
export type ReportDescriptor = {
    loc?: SourceLocation | { line: number; column: number }
    node?: AST.HasLocation
    messageId?: string
    message?: string
    data?: { [key: string]: any }
}
export interface SourceCode {
    text: string
    ast: AST.ESLintProgram
    lines: string[]
    hasBOM: boolean
    visitorKeys: any
    scopeManager: ScopeManager
    getAllComments: () => AST.Token[]

    getText(node?: AST.Node, beforeCount?: number, afterCount?: number): string

    getLines(): string[]

    getNodeByRangeIndex(index: number): AST.ESLintNode | null

    getLocFromIndex(index: number): LineAndColumnData

    getIndexFromLoc(location: LineAndColumnData): number
}
type HasPostCSSSource = {
    source: postcss.NodeSource
}
export type PostCSSNode =
    | PostCSSRoot
    | PostCSSAtRule
    | PostCSSRule
    | PostCSSDeclaration
    | PostCSSComment
type PostCSSChildNode = (
    | PostCSSAtRule
    | PostCSSRule
    | PostCSSDeclaration
    | PostCSSComment
) &
    postcss.ChildNode
export interface PostCSSRoot extends postcss.Root, HasPostCSSSource {
    nodes: PostCSSChildNode[]
    source: postcss.NodeSource & {
        input: postcss.Input & {
            css: string
        }
    }
}
export interface PostCSSAtRule extends postcss.AtRule, HasPostCSSSource {
    nodes: PostCSSChildNode[]
    raws: postcss.AtRuleRaws & {
        params?: {
            raw: string
        }
    }
    source: postcss.NodeSource
}
export interface PostCSSRule extends postcss.Rule, HasPostCSSSource {
    nodes: PostCSSChildNode[]
    raws: postcss.RuleRaws & {
        selector?: {
            raw: string
        }
    }
    source: postcss.NodeSource
}
export type PostCSSDeclaration = postcss.Declaration & HasPostCSSSource
export interface PostCSSComment extends postcss.Comment, HasPostCSSSource {
    raws: postcss.NodeRaws & {
        inline?: boolean
    }
    source: postcss.NodeSource
}
export type PostCSSContainer = PostCSSRoot | PostCSSAtRule | PostCSSRule

export type PostCSSSPNode =
    | PostCSSSPTypeNode
    | PostCSSSPIDNode
    | PostCSSSPClassNameNode
    | PostCSSSPNestingNode
    | PostCSSSPUniversalNode
    | PostCSSSPAttributeNode
    | PostCSSSPPseudoNode
    | PostCSSSPCombinatorNode
    | PostCSSSPCommentNode
    | PostCSSSPStringNode
    | PostCSSSPRootNode
    | PostCSSSPSelector
export type PostCSSSPTypeNode = selectorParser.Tag
export type PostCSSSPIDNode = selectorParser.Identifier
export type PostCSSSPClassNameNode = selectorParser.ClassName
export type PostCSSSPNestingNode = selectorParser.Nesting
export type PostCSSSPUniversalNode = selectorParser.Universal
export interface PostCSSSPAttributeNode extends selectorParser.Attribute {
    raws: PropType<selectorParser.Attribute, "raws"> & {
        insensitiveFlag?: string
    }
}
export type PostCSSSPPseudoNode = selectorParser.Pseudo
export type PostCSSSPCombinatorNode = selectorParser.Combinator
export type PostCSSSPCommentNode = selectorParser.Comment
export type PostCSSSPStringNode = selectorParser.String
export type PostCSSSPRootNode = selectorParser.Root
export type PostCSSSPSelector = selectorParser.Selector

export type PostCSSSPContainer =
    | PostCSSSPRootNode
    | PostCSSSPSelector
    | PostCSSSPPseudoNode

export interface PostCSSLoc {
    line: number
    column: number
}
type PropType<TObj, TProp extends keyof TObj> = TObj[TProp]
