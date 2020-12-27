import assert from "assert"

import fs from "fs"
import path from "path"

import { createQueryContext } from "../../../../lib/styles/selectors/query"
import { getResolvedSelectors } from "../../../../lib/styles/selectors"

import {
    getStyleFixtureResults,
    writeFixture,
    deleteFixture,
    isExistsPath,
} from "../test-utils"
import type { AST, RuleContext, VDirectiveKey } from "../../../../lib/types"
import type {
    StyleContext,
    ValidStyleContext,
} from "../../../../lib/styles/context"
import { parseQueryOptions } from "../../../../lib/options"
import {
    isVDirective,
    isVDirectiveKeyV6,
} from "../../../../lib/utils/templates"

const ROOT = path.join(__dirname, "../fixtures/selectors/query")

/**
 * Remove `parent` properties from the given AST.
 * @param {string} key The key.
 * @param {any} value The value of the key.
 * @returns {any} The value of the key to output.
 */
function replacer(key: string, value: any): any {
    if (key === "parent" || key === "node" || key === "lang") {
        return undefined
    }
    return value
}

function queries(style: StyleContext, context: RuleContext) {
    const selectors = getResolvedSelectors(style as ValidStyleContext)
    return selectors
        .map((r) => r.selector)
        .reduce((result, selector) => {
            let q = createQueryContext(context, parseQueryOptions({}))
            for (const node of selector) {
                q = q.queryStep(node)
            }
            const elementsTexts = q.elements.map((e) =>
                buildElementText(e, context),
            )
            const selectorText = selector.map((s) => s.selector).join("")
            result[selectorText] = elementsTexts
            return result
        }, {} as { [key: string]: string[] })
}

function reverseQueries(style: StyleContext, context: RuleContext) {
    const selectors = getResolvedSelectors(style as ValidStyleContext)
    return selectors
        .map((r) => r.selector)
        .reduce((result, selector) => {
            const document = createQueryContext(context, parseQueryOptions({}))
            const elementQueries = document.split()
            const elementsTexts = elementQueries
                .filter((elementQuery) => {
                    // Set dummy document
                    ;(elementQuery as any).document = elementQuery
                    ;(elementQuery as any).context = (document as any).context
                    ;(elementQuery as any).options = (document as any).options
                    ;(elementQuery as any).docsModifiers = (document as any).docsModifiers
                    let q = elementQuery
                    for (let index = selector.length - 1; index >= 0; index--) {
                        q = q.reverseQueryStep(selector[index])
                    }
                    return Boolean(q.elements.length)
                })
                .map((elementQuery) => elementQuery.elements[0])
                .map((e) => buildElementText(e, context))
            const selectorText = selector.map((s) => s.selector).join("")
            result[selectorText] = elementsTexts
            return result
        }, {} as { [key: string]: string[] })
}

function buildElementText(e: AST.VElement, context: RuleContext): string {
    const id = getAttrText(e, "id", context)
    const className = getAttrText(e, "class", context)
    const idText = id
        ? `#${id.type === "value" ? id.value : `{${id.value}}`}`
        : ""
    const classText = className
        ? `.${
              className.type === "value"
                  ? className.value.split(/\s+/gu).join(".")
                  : `{${className.value}}`
          }`
        : ""
    const text = `${e.name}${idText}${classText}`
    if (
        e.parent &&
        e.parent.parent &&
        e.parent.parent.parent // e.parent.parent === tempalte
    ) {
        return `${buildElementText(e.parent, context)}>${text}`
    }
    return text
}

// eslint-disable-next-line complexity -- test
function getAttrText(
    element: AST.VElement,
    name: string,
    context: RuleContext,
) {
    const { startTag } = element
    for (const attr of startTag.attributes) {
        if (!isVDirective(attr)) {
            const { key, value } = attr
            if (key.name === name) {
                return {
                    type: "value",
                    value: (value && value.value) || "",
                }
            }
        } else {
            const key = attr.key as VDirectiveKey
            const { value } = attr
            if (isVDirectiveKeyV6(key)) {
                if (key.name.name !== "bind") {
                    continue
                }
                if (
                    key.argument &&
                    (key.argument.type !== "VIdentifier" ||
                        key.argument.name !== name)
                ) {
                    continue
                }
                return {
                    type: "expr",
                    value:
                        (value &&
                            value.expression &&
                            context
                                .getSourceCode()
                                .getText(value.expression)) ||
                        "",
                }
            }
            // vue-eslint-parser@<6.0.0
            if (key.name !== "bind") {
                continue
            }
            if (key.argument !== name) {
                continue
            }
            return {
                type: "expr",
                value:
                    (value &&
                        value.expression &&
                        context.getSourceCode().getText(value.expression)) ||
                    "",
            }
        }
    }
    return null
}

describe("CSS Query Test.", () => {
    for (const { name, style, context, dir } of getStyleFixtureResults(ROOT)) {
        describe(`'styles/selectors/query/fixtures/${name}/source.vue'`, () => {
            it("should be query results to valid ressults.", () => {
                const resultPath = path.join(dir, "query-result.json")

                const actual = JSON.stringify(
                    queries(style, context),
                    replacer,
                    4,
                )

                try {
                    const expected = fs.readFileSync(resultPath, "utf8")

                    assert.strictEqual(actual, expected)
                } catch (e) {
                    writeFixture(resultPath, actual)
                    throw e
                }
            })

            it("should be reverse query results to valid ressults.", () => {
                const resultPathNormal = path.join(dir, "query-result.json")
                const resultPathReverse = path.join(
                    dir,
                    "reverse-query-result.json",
                )

                const actual = JSON.stringify(
                    reverseQueries(style, context),
                    replacer,
                    4,
                )
                const expectedNormal = fs.readFileSync(resultPathNormal, "utf8")
                if (isExistsPath(resultPathReverse)) {
                    let expectedReverse = null
                    try {
                        expectedReverse = fs.readFileSync(
                            resultPathReverse,
                            "utf8",
                        )
                        assert.strictEqual(actual, expectedReverse)
                    } catch (e) {
                        writeFixture(resultPathReverse, actual)
                        throw e
                    }

                    try {
                        assert.notStrictEqual(expectedReverse, expectedNormal)
                    } catch (e) {
                        if (expectedReverse) {
                            deleteFixture(resultPathReverse)
                        }
                        throw e
                    }
                } else {
                    try {
                        assert.strictEqual(actual, expectedNormal)
                    } catch (e) {
                        writeFixture(resultPathReverse, actual)
                        throw e
                    }
                }
            })
        })
    }
})
