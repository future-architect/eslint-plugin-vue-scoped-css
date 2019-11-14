import assert from "assert"

import fs from "fs"
import path from "path"

// eslint-disable-next-line @mysticatea/ts/ban-ts-ignore
// @ts-ignore
import CSSStringifier from "postcss/lib/stringifier"
// eslint-disable-next-line @mysticatea/ts/ban-ts-ignore
// @ts-ignore
import SCSSStringifier from "postcss-scss/lib/scss-stringifier"

import { getStyleFixtureResults, writeFixture } from "../test-utils"
import { VCSSNode, VCSSSelectorNode } from "../../../../lib/styles/ast"

function stringify(node: any, stringifier: any) {
    let semicolon = true
    if (node.parent && node.parent.last === node) {
        semicolon = node.parent.raws.semicolon
    }
    const beforeText = node.raws.before && /[^\s/]$/u.exec(node.raws.before)
    if (beforeText) {
        stringifier.builder(beforeText[0])
    }
    stringifier.stringify(node, semicolon)
}

const Stringifys = {
    scss(node: any, builder: any) {
        const stringifier = new SCSSStringifier(builder)
        stringify(node, stringifier)
    },
    css(node: any, builder: any) {
        const stringifier = new CSSStringifier(builder)
        stringify(node, stringifier)
    },
}

/**
 * Remove `parent` proeprties from the given AST.
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

function simpleReplacer(key: string, value: any): any {
    if (key === "parent" || key === "node" || key === "lang") {
        return undefined
    }
    if (key === "loc" || key === "range" || key === "start" || key === "end") {
        return undefined
    }
    return value
}

describe("CSS Nodes Test.", () => {
    for (const { name, style, source, dir } of getStyleFixtureResults()) {
        describe(`'styles/fixtures/${name}/source.vue'`, () => {
            it("should be parsed to valid location.", () => {
                if (!style.cssNode) {
                    throw new Error("invalid")
                }
                checkCSSNodeLocations(source, style.cssNode, style.lang)
            })
            it("should be parsed to valid AST.", () => {
                const resultPath = path.join(dir, "ast.json")

                const actual = JSON.stringify(style.cssNode, replacer, 4)

                try {
                    const expected = fs.readFileSync(resultPath, "utf8")

                    assert.strictEqual(actual, expected)
                } catch (e) {
                    writeFixture(resultPath, actual)
                    throw e
                }
            })
            it("should be parsed to valid simple AST.", () => {
                const resultPath = path.join(dir, "ast.json")

                const actual = JSON.stringify(style.cssNode, simpleReplacer, 4)

                const expected = JSON.stringify(
                    JSON.parse(fs.readFileSync(resultPath, "utf8")),
                    simpleReplacer,
                    4,
                )

                assert.strictEqual(actual, expected)
            })
            it("should be copied to valid AST.", () => {
                const resultPath = path.join(dir, "ast.json")

                const actual = JSON.stringify(
                    deepCopy(style.cssNode),
                    replacer,
                    4,
                )

                const expected = fs.readFileSync(resultPath, "utf8")

                assert.strictEqual(actual, expected)
            })
        })
    }
})

// eslint-disable-next-line complexity
function checkCSSNodeLocations(
    code: string,
    node: VCSSNode | VCSSSelectorNode,
    lang: string,
) {
    if (node.node) {
        const rangeText = `${node.type}:\n${code.slice(...node.range)}`
        let postcssText = (node.node as any).toString((Stringifys as any)[lang])
        if (node.type === "VCSSSelector" || node.type === "VCSSClassSelector") {
            postcssText = postcssText.replace(
                /\s*\/\*(?![\s\S]*\*\/[\s\S]*\/\*)([\s\S]*?)\*\/\s*$/u,
                "",
            )
            postcssText = postcssText.replace(/^\s*\/\*([\s\S]*?)\*\/\s*/u, "")
            postcssText = postcssText.replace(/^\s*\/\/([^\n]*?)\n/u, "")
        } else if (node.type === "VCSSSelectorCombinator") {
            postcssText = postcssText.replace(
                /\/\*(?![\s\S]*\*\/[\s\S]*\/\*)([\s\S]*?)\*\/\s*$/u,
                "",
            )
            postcssText = postcssText.replace(/^\s*\/\*([\s\S]*?)\*\//u, "")
            postcssText = postcssText.replace(/\/\/([^\n]*?)\n\s*$/u, "")
        }
        if (
            node.type === "VCSSSelectorCombinator" &&
            postcssText.trim() === ""
        ) {
            // noop
        } else if (node.type === "VCSSStyleSheet") {
            // noop
        } else {
            postcssText = postcssText.trim()
        }
        assert.strictEqual(rangeText, `${node.type}:\n${postcssText}`)
    }
    if (node.type === "VCSSStyleSheet") {
        if (node.errors.length) {
            return
        }
        const text = code.slice(...node.range)
        assert.strictEqual(text, (node.node as any).source.input.css)
    } else if (node.type === "VCSSStyleRule") {
        const text = code.slice(...node.range)
        assert.strictEqual(
            text.slice(0, node.rawSelectorText.length),
            node.rawSelectorText,
        )
        assert.strictEqual(text[text.length - 1], "}")
        for (const n of node.selectors) {
            checkCSSNodeLocations(code, n, lang)
        }
    } else if (node.type === "VCSSDeclarationProperty") {
        const text = code.slice(...node.range)
        assert.ok(text.includes(node.property), "node.property")
        assert.ok(text.includes(node.value), "node.value")
        if (text.indexOf(node.value) !== text.length - node.value.length) {
            assert.strictEqual(text[text.length - 1], ";")
        }
    } else if (node.type === "VCSSAtRule") {
        const text = code.slice(...node.range)
        const expected = `@${node.name}`
        assert.strictEqual(text.slice(0, expected.length), expected)
        const last = text[text.length - 1]
        assert.ok(last === "}" || last === ";", `act:${text[text.length - 1]}`)
    } else if (node.type === "VCSSSelector") {
        const { parent } = node

        if (parent.selectors) {
            // parent===VCSSStyleRule
            const selectorTexts = parent.selectors.map(s =>
                code.slice(...s.range),
            )
            const rawSelectorText = parent.rawSelectorText as string
            let index = 0
            for (const selectorText of selectorTexts) {
                const idx = rawSelectorText.indexOf(selectorText, index)
                if (idx >= 0) {
                    assert.strictEqual(
                        selectorText,
                        rawSelectorText.slice(idx, idx + selectorText.length),
                    )
                    index = idx + selectorText.length
                } else {
                    assert.strictEqual(
                        selectorText,
                        rawSelectorText.slice(
                            index,
                            index + selectorText.length,
                        ),
                    )
                }
            }
        }
    } else if (
        node.type === "VCSSTypeSelector" ||
        node.type === "VCSSIDSelector" ||
        node.type === "VCSSClassSelector" ||
        node.type === "VCSSNestingSelector" ||
        node.type === "VCSSUniversalSelector" ||
        node.type === "VCSSAttributeSelector" ||
        node.type === "VCSSSelectorCombinator"
    ) {
        const text = code.slice(...node.range)

        if (text.trim()) {
            assert.strictEqual(text, node.selector)
        } else {
            assert.strictEqual(text.trim(), node.selector.trim())
        }
    } else if (node.type === "VCSSSelectorPseudo") {
        const text = code.slice(...node.range)

        assert.strictEqual(text.slice(0, node.value.length), node.value)
    } else if (node.type === "VCSSUnknownSelector") {
        const text = code.slice(...node.range)

        assert.strictEqual(text, node.value)
    } else {
        // Need to add testcase
        console.log(node)
    }
    if ((node as any).nodes) {
        for (const n of (node as any).nodes) {
            checkCSSNodeLocations(code, n, lang)
        }
    }
}

function deepCopy(node: any) {
    const newNode = node.copy()
    if (newNode.nodes) {
        newNode.nodes = newNode.nodes.map(deepCopy).map((c: any) => {
            c.parent = newNode
            return c
        })
    }
    if (newNode.comments) {
        newNode.comments = newNode.comments.map(deepCopy).map((c: any) => {
            c.parent = newNode
            return c
        })
    }
    if (newNode.selectors) {
        newNode.selectors = newNode.selectors.map(deepCopy).map((c: any) => {
            c.parent = newNode
            return c
        })
    }

    return newNode
}
