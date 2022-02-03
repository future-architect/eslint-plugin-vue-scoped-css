import { escapeRegExp } from "../utils"
import type { AST } from "../../types"
import { Interpolation } from "./interpolation"
import type {
    VCSSIDSelector,
    VCSSClassSelector,
    VCSSTypeSelector,
    VCSSAtRule,
    VCSSDeclarationProperty,
} from "../ast"
import getSelectorTemplateElements from "./selector"
import getAtRuleParamsTemplateElements from "./at-rule-params"
import getDeclValueTemplateElements from "./decl-value"
import { isDefined } from "../../utils/utils"

export { Interpolation }

/**
 * This class checks whether the identifiers match including interpolation.
 */
export class Template {
    public static interpolationTemplate = new Template([new Interpolation("?")])

    public elements: (Interpolation | string)[]

    public readonly string: string | null = null

    private _text: string | null = null

    private _regexp: RegExp | null = null

    public constructor(
        elements: (Interpolation | string | null | undefined)[],
    ) {
        this.elements = elements
            .filter(isDefined)
            .filter((e) => e !== "")
            .reduce((l, e) => {
                if (l.length) {
                    const lastIndex = l.length - 1
                    const last = l[lastIndex]
                    if (typeof e === "string" && typeof last === "string") {
                        l[lastIndex] = last + e
                        return l
                    }
                    if (typeof e !== "string" && typeof last !== "string") {
                        l[lastIndex] = new Interpolation(last.text + e.text)
                        return l
                    }
                }
                l.push(e)
                return l
            }, [] as (Interpolation | string)[])

        if (this.elements.length === 1) {
            const element = this.elements[0]
            if (typeof element === "string") {
                this.string = element
            }
        } else if (this.elements.length === 0) {
            this.string = ""
        }
    }

    public static of(value: string): Template {
        return new Template([value])
    }

    public static ofSelector(
        node: VCSSIDSelector | VCSSClassSelector | VCSSTypeSelector,
    ): Template {
        return new Template(getSelectorTemplateElements(node))
    }

    public static ofParams(node: VCSSAtRule): Template {
        return new Template(
            getAtRuleParamsTemplateElements(node.paramsText.trim(), node.lang),
        )
    }

    public static ofDeclValue(text: string, lang: string): Template

    public static ofDeclValue(node: VCSSDeclarationProperty): Template

    public static ofDeclValue(
        nodeOrText: VCSSDeclarationProperty | string,
        lang?: string,
    ): Template {
        if (typeof nodeOrText === "string") {
            return new Template(
                getDeclValueTemplateElements(nodeOrText, lang || ""),
            )
        }
        return new Template(
            getDeclValueTemplateElements(nodeOrText.value, nodeOrText.lang),
        )
    }

    public static ofNode(
        node:
            | AST.ESLintBlockStatement
            | AST.ESLintExpression
            | AST.ESLintPattern
            | AST.ESLintPrivateIdentifier
            | AST.VLiteral
            | AST.VFilterSequenceExpression
            | AST.VForExpression
            | AST.VOnExpression
            | AST.VSlotScopeExpression,
    ): Template | null {
        if (node.type === "VLiteral") {
            return Template.of(node.value)
        }
        if (node.type === "Literal") {
            return Template.of(`${node.value}`)
        }
        if (node.type === "TemplateLiteral") {
            const elements: (string | Interpolation | undefined)[] = []
            for (const element of node.quasis) {
                elements.push(element.value.cooked || element.value.raw)
                elements.push(new Interpolation("${}"))
            }
            elements.pop()
            return new Template(elements)
        }
        if (node.type === "BinaryExpression" && node.operator === "+") {
            const left = Template.ofNode(node.left)
            const right = Template.ofNode(node.right)
            if (left && right) {
                return left.concat(right)
            } else if (left) {
                return left.concat(Template.interpolationTemplate)
            } else if (right) {
                return Template.interpolationTemplate.concat(right)
            }
        }
        return null
    }

    public match(o: Template): boolean {
        if (this.string != null && o.string != null) {
            return this.string === o.string
        }
        if (this.regexp.test(o.text)) {
            return true
        }
        if (o.regexp.test(this.text)) {
            return true
        }
        return false
    }

    public matchString(s: string): boolean {
        if (this.string != null) {
            return this.string === s
        }
        if (this.regexp.test(s)) {
            return true
        }
        return false
    }

    public endsWith(s: string): boolean {
        if (this.string != null) {
            return this.string.endsWith(s)
        }
        const last = this.elements[this.elements.length - 1]
        if (typeof last === "string") {
            if (last.endsWith(s)) {
                return true
            }
        }
        // any
        return true
    }

    public concat(o: string | Template): Template {
        if (typeof o === "string") {
            return new Template([...this.elements, o])
        }

        return new Template([...this.elements, ...o.elements])
    }

    public hasString(s: string): boolean {
        return this.elements.some((e) => {
            if (typeof e === "string") {
                return e.includes(s)
            }
            return false
        })
    }

    public divide(s: string | RegExp): Template[] {
        const results: Template[] = []
        let elements: (string | Interpolation | undefined)[] = []
        for (const e of this.elements) {
            if (typeof e === "string") {
                if (e.search(s) >= 0) {
                    const list = e.split(s)
                    elements.push(list.shift())
                    results.push(new Template(elements))
                    while (list.length > 1) {
                        results.push(new Template([list.shift()]))
                    }
                    elements = [list.shift()]
                } else {
                    elements.push(e)
                }
            } else {
                elements.push(e)
            }
        }
        if (elements.length) {
            results.push(new Template(elements))
        }
        return results
    }

    public toLowerCase(): Template {
        return new Template(
            this.elements.map((e) => {
                if (typeof e === "string") {
                    return e.toLowerCase()
                }
                return e
            }),
        )
    }

    private get text(): string {
        return this._text || (this._text = this.buildText())
    }

    private get regexp(): RegExp {
        return this._regexp || (this._regexp = this.buildRegexp())
    }

    private buildRegexp(): RegExp {
        let expr = "^"
        for (const e of this.elements) {
            if (typeof e === "string") {
                expr += escapeRegExp(e)
            } else {
                expr += "[\\s\\S]*"
            }
        }
        expr += "$"
        return new RegExp(expr, "u")
    }

    private buildText(): string {
        let text = ""
        for (const e of this.elements) {
            if (typeof e === "string") {
                text += e
            } else {
                text += "\ue000"
            }
        }
        return text
    }
}
