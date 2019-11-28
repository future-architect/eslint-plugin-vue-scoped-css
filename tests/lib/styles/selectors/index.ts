import assert from "assert"

import fs from "fs"
import path from "path"

import { getStyleFixtureResults, writeFixture } from "../test-utils"
import { getResolvedSelectors } from "../../../../lib/styles/selectors"
import { ValidStyleContext } from "../../../../lib/styles/context"

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

describe("CSS Selectors Test.", () => {
    for (const { name, style, dir } of getStyleFixtureResults()) {
        describe(`'styles/fixtures/${name}/source.vue'`, () => {
            it("should be parsed to valid selectors.", () => {
                const resultPath = path.join(dir, "selectors.json")

                const actual = JSON.stringify(
                    getResolvedSelectors(style as ValidStyleContext).map(
                        r => r.selector,
                    ),
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
            it("should be parsed to valid selectors text.", () => {
                const resultPath = path.join(dir, "selectors-text.json")

                const actual = JSON.stringify(
                    getResolvedSelectors(style as ValidStyleContext).map(r =>
                        r.selector.map(s => s.selector),
                    ),
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
            it("AST should not be changed.", () => {
                const resultPath = path.join(dir, "ast.json")

                const actual = JSON.stringify(style.cssNode, replacer, 4)

                const expected = fs.readFileSync(resultPath, "utf8")

                assert.strictEqual(actual, expected)
            })
        })
    }
})
