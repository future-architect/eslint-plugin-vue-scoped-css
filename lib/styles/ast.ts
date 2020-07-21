import type {
    SourceLocation,
    Range,
    PostCSSNode,
    PostCSSRule,
    PostCSSDeclaration,
    PostCSSAtRule,
    PostCSSSPNode,
    PostCSSSPTypeNode,
    PostCSSSPIDNode,
    PostCSSSPClassNameNode,
    PostCSSSPNestingNode,
    PostCSSSPUniversalNode,
    PostCSSSPAttributeNode,
    PostCSSSPPseudoNode,
    PostCSSSPCombinatorNode,
    PostCSSComment,
    PostCSSSPCommentNode,
    PostCSSRoot,
} from "../types"

type CopyProps = {
    node?: PostCSSNode | PostCSSSPNode
    loc?: SourceLocation
    start?: number
    end?: number
}
/**
 * The node
 */
class Node<T extends string> {
    public readonly type: T
    public readonly loc: SourceLocation
    public start: number
    public end: number
    public range: Range
    public readonly node: PostCSSNode | PostCSSSPNode
    public readonly lang: string
    /**
     * constructor.
     * @param  {PostCSSNode | PostCSSSPNode} node PostCSS node.
     * @param  {string} type The token type.
     * @param  {SourceLocation} loc  The location.
     * @param  {number} start  The index of start.
     * @param  {number} end  The index of end.
     * @param  {object} props  The optional property.
     * @returns {void}
     */
    protected constructor(
        node: PostCSSNode | PostCSSSPNode,
        type: T,
        loc: SourceLocation,
        start: number,
        end: number,
        lang: string,
    ) {
        this.type = type
        this.loc = loc
        this.start = start
        this.end = end
        this.range = [start, end]
        this.node = node
        this.lang = lang
    }
}

/**
 * The has parent node
 */
class HasParentNode<
    T extends string,
    P extends VCSSContainerNode | VCSSSelector | VCSSSelectorPseudo
> extends Node<T> {
    public readonly parent: P
    protected constructor(
        node: PostCSSNode | PostCSSSPNode,
        type: T,
        loc: SourceLocation,
        start: number,
        end: number,
        props: {
            parent: P
        },
    ) {
        super(node, type, loc, start, end, props.parent.lang)
        this.parent = props.parent
    }
}
/**
 * The CSS Parsing Error.
 */
export class VCSSParsingError extends Node<"VCSSParsingError"> {
    public readonly message: string
    /**
     * constructor.
     * @param  {PostCSSDeclaration} node  The node.
     * @param  {SourceLocation} loc  The location.
     * @param  {number} start  The index of start.
     * @param  {number} end  The index of end.
     * @param  {object} props  The optional property.
     * @returns {void}
     */
    public constructor(
        node: PostCSSDeclaration,
        loc: SourceLocation,
        start: number,
        end: number,
        props: {
            lang: string
            message: string
        },
    ) {
        super(node, "VCSSParsingError", loc, start, end, props.lang)
        this.message = props.message
    }
}

/**
 * The CSS root node.
 */
export class VCSSStyleSheet extends Node<"VCSSStyleSheet"> {
    public nodes: VCSSNode[]
    public comments: VCSSCommentNode[]
    public readonly errors: VCSSParsingError[]
    /**
     * constructor.
     * @param  {PostCSSRoot} node  The node.
     * @param  {SourceLocation} loc  The location.
     * @param  {number} start  The index of start.
     * @param  {number} end  The index of end.
     * @param  {object} props  The optional property.
     * @returns {void}
     */
    public constructor(
        node: PostCSSRoot,
        loc: SourceLocation,
        start: number,
        end: number,
        props: {
            nodes?: VCSSNode[]
            comments?: VCSSCommentNode[]
            errors?: VCSSParsingError[]
            lang: string
        },
    ) {
        super(node, "VCSSStyleSheet", loc, start, end, props.lang)
        this.nodes = props.nodes ?? []
        this.comments = props.comments ?? []
        this.errors = props.errors ?? []
    }

    /**
     * Copy
     * @param  {object} props  The optional change property.
     * @returns {VCSSStyleSheet} copy node
     */
    public copy(props?: CopyProps): VCSSStyleSheet {
        return copyStdNode(this, props)
    }
}
/**
 * The CSS Rule node.
 */
export class VCSSStyleRule extends HasParentNode<
    "VCSSStyleRule",
    VCSSContainerNode
> {
    public nodes: VCSSNode[]
    public readonly selectorText: string
    public readonly rawSelectorText: string
    public selectors: VCSSSelectorNode[]
    /**
     * constructor.
     * @param  {AtRule} node  The node.
     * @param  {SourceLocation} loc  The location.
     * @param  {number} start  The index of start.
     * @param  {number} end  The index of end.
     * @param  {object} props  The optional property.
     * @returns {void}
     */
    public constructor(
        node: PostCSSRule,
        loc: SourceLocation,
        start: number,
        end: number,
        props: {
            parent: VCSSContainerNode
            selectorText?: string
            rawSelectorText: string | null
            selectors?: VCSSSelectorNode[]
            nodes?: VCSSNode[]
        },
    ) {
        super(node, "VCSSStyleRule", loc, start, end, props)

        this.selectorText = props.selectorText ?? node.selector
        if (props.rawSelectorText != null) {
            this.rawSelectorText = props.rawSelectorText
        } else {
            const raws = node.raws
            this.rawSelectorText = raws.selector
                ? raws.selector.raw
                : node.selector
        }
        this.selectors = props.selectors ?? []
        this.nodes = props.nodes ?? []
    }

    /**
     * Copy
     * @param  {object} props  The optional change property.
     * @returns {VCSSStyleRule} copy node
     */
    public copy(props?: CopyProps): VCSSStyleRule {
        return copyStdNode(this, props)
    }
}
/**
 * The CSS Declaration Property node.
 */
export class VCSSDeclarationProperty extends HasParentNode<
    "VCSSDeclarationProperty",
    VCSSContainerNode
> {
    public readonly property: string
    public readonly value: string
    public readonly important: boolean
    /**
     * constructor.
     * @param  {PostCSSDeclaration} node  The node.
     * @param  {SourceLocation} loc  The location.
     * @param  {number} start  The index of start.
     * @param  {number} end  The index of end.
     * @param  {object} props  The optional property.
     * @returns {void}
     */
    public constructor(
        node: PostCSSDeclaration,
        loc: SourceLocation,
        start: number,
        end: number,
        props: {
            parent: VCSSContainerNode
            property?: string
            important?: boolean
            value?: string
        },
    ) {
        super(node, "VCSSDeclarationProperty", loc, start, end, props)

        this.property = props.property ?? node.prop
        this.value = getProp(props, node, "value")
        this.important = props.important ?? Boolean(node.important)
    }

    /**
     * Copy
     * @param  {object} props  The optional change property.
     * @returns {VCSSDeclarationProperty} copy node
     */
    public copy(props?: CopyProps): VCSSDeclarationProperty {
        return copyStdNode(this, props)
    }
}
/**
 * The CSS At(@) Rule node.
 */
export class VCSSAtRule extends HasParentNode<"VCSSAtRule", VCSSContainerNode> {
    public nodes: VCSSNode[]
    public readonly name: string
    public readonly identifier: string
    public readonly paramsText: string
    public readonly rawParamsText: string
    public rawSelectorText?: string
    public selectors?: VCSSSelectorNode[]
    public readonly node: PostCSSAtRule
    /**
     * constructor.
     * @param  {PostCSSAtRule} node  The node.
     * @param  {SourceLocation} loc  The location.
     * @param  {number} start  The index of start.
     * @param  {number} end  The index of end.
     * @param  {object} props  The optional property.
     * @returns {void}
     */
    public constructor(
        node: PostCSSAtRule,
        loc: SourceLocation,
        start: number,
        end: number,
        props: {
            parent: VCSSContainerNode
            identifier: string
            paramsText?: string
            rawParamsText: string | null
            selectors?: VCSSSelectorNode[]
            nodes?: VCSSNode[]
        },
    ) {
        super(node, "VCSSAtRule", loc, start, end, props)
        this.node = node

        this.name = getProp(props, node, "name")
        this.identifier = props.identifier
        this.paramsText = props.paramsText ?? node.params
        if (props.rawParamsText != null) {
            this.rawParamsText = props.rawParamsText
        } else {
            const raws = node.raws
            this.rawParamsText = raws.params?.raw ?? node.params
        }
        this.selectors = props.selectors ?? undefined
        this.nodes = props.nodes ?? []
    }

    /**
     * Copy
     * @param  {object} props  The optional change property.
     * @returns {VCSSAtRule} copy node
     */
    public copy(props?: CopyProps): VCSSAtRule {
        return copyStdNode(this, props)
    }
}

/**
 * The CSS Unknown.
 */
export class VCSSUnknown extends HasParentNode<
    "VCSSUnknown",
    VCSSContainerNode
> {
    public nodes: VCSSNode[]
    public unknownType?: string
    /**
     * constructor.
     * @param  {PostCSSNode} node  The node.
     * @param  {SourceLocation} loc  The location.
     * @param  {number} start  The index of start.
     * @param  {number} end  The index of end.
     * @param  {object} props  The optional property.
     * @returns {void}
     */
    public constructor(
        node: PostCSSNode,
        loc: SourceLocation,
        start: number,
        end: number,
        props: {
            parent: VCSSContainerNode
            nodes?: VCSSNode[]
            unknownType?: string
        },
    ) {
        super(node, "VCSSUnknown", loc, start, end, props)

        this.nodes = props.nodes ?? []
        this.unknownType = props.unknownType
    }

    /**
     * Copy
     * @param  {object} props  The optional change property.
     * @returns {VCSSUnknown} copy node
     */
    public copy(props?: CopyProps): VCSSUnknown {
        return copyStdNode(this, props)
    }
}

/**
 * The CSS Selector node.
 */
export class VCSSSelector extends HasParentNode<
    "VCSSSelector",
    VCSSStyleRule | VCSSAtRule | VCSSSelectorPseudo
> {
    public nodes: VCSSSelectorValueNode[]
    public parent: VCSSStyleRule | VCSSAtRule | VCSSSelectorPseudo
    /**
     * constructor.
     * @param  {object} node  The node.
     * @param  {SourceLocation} loc  The location.
     * @param  {number} start  The index of start.
     * @param  {number} end  The index of end.
     * @param  {object} props  The optional property.
     * @returns {void}
     */
    public constructor(
        node: PostCSSSPNode,
        loc: SourceLocation,
        start: number,
        end: number,
        props: {
            parent: VCSSStyleRule | VCSSAtRule | VCSSSelectorPseudo
            nodes?: VCSSSelectorValueNode[]
        },
    ) {
        super(node, "VCSSSelector", loc, start, end, props)

        this.nodes = props.nodes ?? []
        this.parent = props.parent
    }

    /**
     * Copy
     * @param  {object} props  The optional change property.
     * @returns {VCSSSelector} copy node
     */
    public copy(props?: CopyProps): VCSSSelector {
        return copyStdNode(this, props)
    }

    public get selector(): string {
        return this.nodes.map((n) => n.selector).join("")
    }
}
/**
 * The CSS Type Selector node.
 */
export class VCSSTypeSelector extends HasParentNode<
    "VCSSTypeSelector",
    VCSSSelector
> {
    public readonly value: string
    public readonly selector: string
    /**
     * constructor.
     * @param  {object} node  The node.
     * @param  {SourceLocation} loc  The location.
     * @param  {number} start  The index of start.
     * @param  {number} end  The index of end.
     * @param  {object} props  The optional property.
     * @returns {void}
     */
    public constructor(
        node: PostCSSSPTypeNode,
        loc: SourceLocation,
        start: number,
        end: number,
        props: {
            parent: VCSSSelector
            value?: string
        },
    ) {
        super(node, "VCSSTypeSelector", loc, start, end, props)
        this.value = getProp(props, node, "value")
        this.selector = this.value
    }

    /**
     * Copy
     * @param  {object} props  The optional change property.
     * @returns {VCSSTypeSelector} copy node
     */
    public copy(
        props?: CopyProps & {
            parent?: VCSSSelector
            value?: string
        },
    ): VCSSTypeSelector {
        return copyStdNode(this, props)
    }
}
/**
 * The CSS ID Selector node.
 */
export class VCSSIDSelector extends HasParentNode<
    "VCSSIDSelector",
    VCSSSelector
> {
    public readonly value: string
    public readonly selector: string
    /**
     * constructor.
     * @param  {object} node  The node.
     * @param  {SourceLocation} loc  The location.
     * @param  {number} start  The index of start.
     * @param  {number} end  The index of end.
     * @param  {object} props  The optional property.
     * @returns {void}
     */
    public constructor(
        node: PostCSSSPIDNode,
        loc: SourceLocation,
        start: number,
        end: number,
        props: { parent: VCSSSelector; value?: string },
    ) {
        super(node, "VCSSIDSelector", loc, start, end, props)
        this.value = getProp(props, node, "value")
        this.selector = `#${this.value}`
    }

    /**
     * Copy
     * @param  {object} props  The optional change property.
     * @returns {VCSSIDSelector} copy node
     */
    public copy(
        props?: CopyProps & {
            parent?: VCSSSelector
            value?: string
        },
    ): VCSSIDSelector {
        return copyStdNode(this, props)
    }
}
/**
 * The CSS Class Selector node.
 */
export class VCSSClassSelector extends HasParentNode<
    "VCSSClassSelector",
    VCSSSelector
> {
    public readonly value: string
    public readonly selector: string
    /**
     * constructor.
     * @param  {object} node  The node.
     * @param  {SourceLocation} loc  The location.
     * @param  {number} start  The index of start.
     * @param  {number} end  The index of end.
     * @param  {object} props  The optional property.
     * @returns {void}
     */
    public constructor(
        node: PostCSSSPClassNameNode,
        loc: SourceLocation,
        start: number,
        end: number,
        props: { parent: VCSSSelector; value?: string },
    ) {
        super(node, "VCSSClassSelector", loc, start, end, props)
        this.value = getProp(props, node, "value")
        this.selector = `.${this.value}`
    }

    /**
     * Copy
     * @param  {object} props  The optional change property.
     * @returns {VCSSClassSelector} copy node
     */
    public copy(
        props?: CopyProps & {
            parent?: VCSSSelector
            value?: string
        },
    ): VCSSClassSelector {
        return copyStdNode(this, props)
    }
}
/**
 * The CSS Nesting Selector node.
 */
export class VCSSNestingSelector extends HasParentNode<
    "VCSSNestingSelector",
    VCSSSelector
> {
    public readonly value: string
    public readonly selector: string
    /**
     * constructor.
     * @param  {object} node  The node.
     * @param  {SourceLocation} loc  The location.
     * @param  {number} start  The index of start.
     * @param  {number} end  The index of end.
     * @param  {object} props  The optional property.
     * @returns {void}
     */
    public constructor(
        node: PostCSSSPNestingNode,
        loc: SourceLocation,
        start: number,
        end: number,
        props: { parent: VCSSSelector; value?: string },
    ) {
        super(node, "VCSSNestingSelector", loc, start, end, props)
        this.value = getProp(props, node, "value")
        this.selector = this.value
    }

    /**
     * Copy
     * @param  {object} props  The optional change property.
     * @returns {VCSSNestingSelector} copy node
     */
    public copy(
        props?: CopyProps & {
            parent?: VCSSSelector
            value?: string
        },
    ): VCSSNestingSelector {
        return copyStdNode(this, props)
    }
}
/**
 * The CSS Universal Selector node.
 */
export class VCSSUniversalSelector extends HasParentNode<
    "VCSSUniversalSelector",
    VCSSSelector
> {
    public readonly value: string
    public readonly selector: string
    /**
     * constructor.
     * @param  {object} node  The node.
     * @param  {SourceLocation} loc  The location.
     * @param  {number} start  The index of start.
     * @param  {number} end  The index of end.
     * @param  {object} props  The optional property.
     * @returns {void}
     */
    public constructor(
        node: PostCSSSPUniversalNode,
        loc: SourceLocation,
        start: number,
        end: number,
        props: { parent: VCSSSelector; value?: string },
    ) {
        super(node, "VCSSUniversalSelector", loc, start, end, props)
        this.value = getProp(props, node, "value")
        this.selector = this.value
    }

    /**
     * Copy
     * @param  {object} props  The optional change property.
     * @returns {VCSSUniversalSelector} copy node
     */
    public copy(
        props?: CopyProps & {
            parent?: VCSSSelector
            value?: string
        },
    ): VCSSUniversalSelector {
        return copyStdNode(this, props)
    }
}
/**
 * The CSS Attribuute Selector node.
 */
export class VCSSAttributeSelector extends HasParentNode<
    "VCSSAttributeSelector",
    VCSSSelector
> {
    public readonly value: string | null
    public readonly attribute: string
    public readonly operator: string | null
    public readonly quoteMark: string | null
    public readonly insensitiveFlag: string | null
    public readonly selector: string
    /**
     * constructor.
     * @param  {object} node  The node.
     * @param  {SourceLocation} loc  The location.
     * @param  {number} start  The index of start.
     * @param  {number} end  The index of end.
     * @param  {object} props  The optional property.
     * @returns {void}
     */
    public constructor(
        node: PostCSSSPAttributeNode,
        loc: SourceLocation,
        start: number,
        end: number,
        props: {
            parent: VCSSSelector
            value?: string
            insensitiveFlag?: string
        },
    ) {
        super(node, "VCSSAttributeSelector", loc, start, end, props)

        this.attribute = getProp(props, node, "attribute")
        const operator = getProp(props, node, "operator")
        this.operator = operator ?? null
        const value = getProp(props, node, "value")
        this.value = value ?? null
        const quoteMark = getProp(props, node, "quoteMark")
        this.quoteMark = quoteMark ?? null

        const raws = node.raws
        if (props.insensitiveFlag != null) {
            this.insensitiveFlag = props.insensitiveFlag
        } else if (raws.insensitiveFlag != null) {
            this.insensitiveFlag = raws.insensitiveFlag
        } else if (node.insensitive) {
            this.insensitiveFlag = "i"
        } else {
            this.insensitiveFlag = null
        }
        this.selector = this.refreshSelector()
    }

    private refreshSelector() {
        let selector = `[${this.attribute}`
        if (this.operator != null) {
            selector += this.operator
            if (this.value != null) {
                selector += this.quoteMark
                    ? this.quoteMark + this.value + this.quoteMark
                    : this.value
            }
        }
        if (this.insensitiveFlag != null) {
            selector += ` ${this.insensitiveFlag}`
        }
        selector += "]"
        return selector
    }

    /**
     * Copy
     * @param  {object} props  The optional change property.
     * @returns {VCSSAttributeSelector} copy node
     */
    public copy(
        props?: CopyProps & {
            parent?: VCSSSelector
            value?: string
        },
    ): VCSSAttributeSelector {
        return copyStdNode(this, props)
    }
}
/**
 * The CSS Pseudo node.
 */
export class VCSSSelectorPseudo extends HasParentNode<
    "VCSSSelectorPseudo",
    VCSSSelector
> {
    public readonly value: string
    public nodes: VCSSSelector[]
    /**
     * constructor.
     * @param  {object} node  The node.
     * @param  {SourceLocation} loc  The location.
     * @param  {number} start  The index of start.
     * @param  {number} end  The index of end.
     * @param  {object} props  The optional property.
     * @returns {void}
     */
    public constructor(
        node: PostCSSSPPseudoNode,
        loc: SourceLocation,
        start: number,
        end: number,
        props: {
            parent: VCSSSelector
            nodes?: VCSSSelector[]
        },
    ) {
        super(node, "VCSSSelectorPseudo", loc, start, end, props)
        this.value = getProp(props, node, "value")

        this.nodes = props.nodes ?? []
    }

    /**
     * Copy
     * @param  {object} props  The optional change property.
     * @returns {VCSSSelectorPseudo} copy node
     */
    public copy(
        props?: CopyProps & {
            parent?: VCSSSelector
            value?: string
        },
    ): VCSSSelectorPseudo {
        return copyStdNode(this, props)
    }

    public get selector(): string {
        if (!this.nodes.length) {
            return this.value
        }
        const params = this.nodes.map((n) => n.selector).join(",")
        return `${this.value}(${params})`
    }
}

/**
 * The CSS Selector Combinator node.
 */
export class VCSSSelectorCombinator extends HasParentNode<
    "VCSSSelectorCombinator",
    VCSSSelector
> {
    public value: string
    public selector: string
    /**
     * constructor.
     * @param  {object} node  The node.
     * @param  {SourceLocation} loc  The location.
     * @param  {number} start  The index of start.
     * @param  {number} end  The index of end.
     * @param  {object} props  The optional property.
     * @returns {void}
     */
    public constructor(
        node: PostCSSSPCombinatorNode,
        loc: SourceLocation,
        start: number,
        end: number,
        props: { parent: VCSSSelector; value?: string },
    ) {
        super(node, "VCSSSelectorCombinator", loc, start, end, props)
        this.value = getProp(props, node, "value")
        this.selector = this.value
    }

    /**
     * Copy
     * @param  {object} props  The optional change property.
     * @returns {VCSSSelectorCombinator} copy node
     */
    public copy(
        props?: CopyProps & {
            parent?: VCSSSelector
            value?: string
        },
    ): VCSSSelectorCombinator {
        return copyStdNode(this, props)
    }
}

/**
 * The CSS Unknown Selector node.
 */
export class VCSSUnknownSelector extends HasParentNode<
    "VCSSUnknownSelector",
    VCSSSelector
> {
    public readonly value: string
    public readonly selector: string
    /**
     * constructor.
     * @param  {object} node  The node.
     * @param  {SourceLocation} loc  The location.
     * @param  {number} start  The index of start.
     * @param  {number} end  The index of end.
     * @param  {object} props  The optional property.
     * @returns {void}
     */
    public constructor(
        node: PostCSSSPNode,
        loc: SourceLocation,
        start: number,
        end: number,
        props: {
            parent: VCSSSelector
        },
    ) {
        super(node, "VCSSUnknownSelector", loc, start, end, props)
        this.value = getProp(props, node, "value") || ""
        this.selector = this.value
    }

    /**
     * Copy
     * @param  {object} props  The optional change property.
     * @returns {VCSSUnknownSelector} copy node
     */
    public copy(
        props?: CopyProps & {
            parent?: VCSSSelector
            value?: string
        },
    ): VCSSUnknownSelector {
        return copyStdNode(this, props)
    }
}

/**
 * The CSS Comment node.
 */
export class VCSSComment extends HasParentNode<
    "VCSSComment",
    VCSSContainerNode | VCSSSelector
> {
    public readonly node: PostCSSComment | PostCSSSPCommentNode
    public readonly text: string
    /**
     * constructor.
     * @param  {object} node  The node.
     * @param  {string} text  The contents.
     * @param  {SourceLocation} loc  The location.
     * @param  {number} start  The index of start.
     * @param  {number} end  The index of end.
     * @param  {object} props  The optional property.
     * @returns {void}
     */
    public constructor(
        node: PostCSSComment | PostCSSSPCommentNode,
        text: string,
        loc: SourceLocation,
        start: number,
        end: number,
        props: { parent: VCSSContainerNode | VCSSSelector },
    ) {
        super(node, "VCSSComment", loc, start, end, props)
        this.node = node
        this.text = text
    }

    /**
     * Copy
     * @param  {object} props  The optional change property.
     * @returns {VCSSComment} copy node
     */
    public copy(
        props?: CopyProps & {
            parent?: VCSSContainerNode | VCSSSelector
            node?: PostCSSComment | PostCSSSPCommentNode
            text?: string
        },
    ): VCSSComment {
        const parent = props?.parent ?? this.parent
        return new VCSSComment(
            props?.node ?? this.node,
            props?.text ?? this.text,
            props?.loc ?? this.loc,
            props?.start ?? this.start,
            props?.end ?? this.end,
            { ...this, ...props, parent },
        )
    }
}
/**
 * The CSS Inline Comment node.
 */
export class VCSSInlineComment extends HasParentNode<
    "VCSSInlineComment",
    VCSSContainerNode | VCSSSelector
> {
    public readonly node: PostCSSComment | PostCSSSPCommentNode
    public readonly text: string
    /**
     * constructor.
     * @param  {object} node  The node.
     * @param  {string} text  The contents.
     * @param  {SourceLocation} loc  The location.
     * @param  {number} start  The index of start.
     * @param  {number} end  The index of end.
     * @param  {object} props  The optional property.
     * @returns {void}
     */
    public constructor(
        node: PostCSSComment | PostCSSSPCommentNode,
        text: string,
        loc: SourceLocation,
        start: number,
        end: number,
        props: { parent: VCSSContainerNode | VCSSSelector },
    ) {
        super(node, "VCSSInlineComment", loc, start, end, props)
        this.node = node
        this.text = text
    }

    /**
     * Copy
     * @param  {object} props  The optional change property.
     * @returns {VCSSInlineComment} copy node
     */
    public copy(
        props?: CopyProps & {
            parent?: VCSSContainerNode | VCSSSelector
            node?: PostCSSComment | PostCSSSPCommentNode
            text?: string
        },
    ): VCSSInlineComment {
        const parent = props?.parent ?? this.parent
        return new VCSSInlineComment(
            props?.node ?? this.node,
            props?.text ?? this.text,
            props?.loc ?? this.loc,
            props?.start ?? this.start,
            props?.end ?? this.end,
            { ...this, ...props, parent },
        )
    }
}

export type VCSS = VCSSNode | VCSSSelectorNode

export type VCSSNode =
    | VCSSContainerNode
    | VCSSDeclarationProperty
    | VCSSCommentNode
export type VCSSCommentNode = VCSSInlineComment | VCSSComment
export type VCSSContainerNode =
    | VCSSStyleSheet
    | VCSSStyleRule
    | VCSSAtRule
    | VCSSUnknown

// selectors
export type VCSSSelectorNode =
    | VCSSSelector
    | VCSSTypeSelector
    | VCSSIDSelector
    | VCSSClassSelector
    | VCSSNestingSelector
    | VCSSUniversalSelector
    | VCSSAttributeSelector
    | VCSSSelectorPseudo
    | VCSSSelectorCombinator
    | VCSSUnknownSelector
// export type VCSSSelectorContainerNode = VCSSSelector | VCSSSelectorPseudo
export type VCSSSelectorValueNode =
    | VCSSTypeSelector
    | VCSSIDSelector
    | VCSSClassSelector
    | VCSSNestingSelector
    | VCSSUniversalSelector
    | VCSSAttributeSelector
    | VCSSSelectorPseudo
    | VCSSSelectorCombinator
    | VCSSUnknownSelector

/**
 * Get property from given props or node
 * @param {object} props The optional property.
 * @param {object} node The node.
 * @param {string} name name of property
 */
function getProp<N extends PostCSSNode | PostCSSSPNode, K extends keyof N>(
    props: any,
    node: N,
    name: K,
): N[K] {
    if (props?.[name] != null) {
        const v = props[name]
        return v
    }
    return node[name]
}

/**
 * Copy the given ASTNode.
 * @param astNode ASTNode
 * @param props The optional property.
 */
function copyStdNode<N extends Node<T>, T extends string, CP extends CopyProps>(
    astNode: N,
    props?: CP,
): N & Required<CP> {
    const C = astNode.constructor as { new (...args: any[]): N & Required<CP> }
    return new C(
        props?.node ?? astNode.node,
        props?.loc ?? astNode.loc,
        props?.start ?? astNode.start,
        props?.end ?? astNode.end,
        { ...astNode, ...props },
    )
}
