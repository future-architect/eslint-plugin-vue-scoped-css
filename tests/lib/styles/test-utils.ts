import eslint from "eslint"

import fs from "fs"
import path from "path"

import type { RuleContext } from "../../../lib/types"
import { StyleContext, getStyleContexts } from "../../../lib/styles/context"

const ROOT = path.join(__dirname, "./fixtures/index")

const ruleId = "test"

const config = {
    parser: "vue-eslint-parser",
    parserOptions: { ecmaVersion: 2019, sourceType: "module" },
    rules: {
        [ruleId]: "error",
    },
}

/**
 * Execute eslint
 * @param {string} source the source code
 */
function executeLint(
    source: string,
    sourcePath: string,
    _name: string,
): { style: StyleContext; context: RuleContext } {
    const linter = new eslint.Linter()
    let style: StyleContext | null = null
    let context: RuleContext | null = null
    let err = null
    linter.defineParser("vue-eslint-parser", require("vue-eslint-parser"))
    linter.defineRule(ruleId, {
        create(ctx: RuleContext) {
            try {
                context = ctx
                style = getStyleContexts(ctx)[0]
            } catch (e) {
                err = e
            }
            return {}
        },
    } as any)
    linter.verifyAndFix(source, config as any, sourcePath)
    if (err) {
        throw err
    }
    if (!style || !context) {
        throw new Error("invalid state")
    }
    return { style, context }
}

export function* getStyleFixtureResults(rootDir = ROOT) {
    for (const name of fs.readdirSync(rootDir)) {
        if (name === ".DS_Store") {
            continue
        }
        const sourcePath = path.join(rootDir, `${name}/source.vue`)
        const source = fs.readFileSync(sourcePath, "utf8")

        const { style, context } = executeLint(source, sourcePath, name)
        yield {
            name,
            style,
            source,
            context,
            dir: path.join(rootDir, `${name}`),
        }
    }
}

export function writeFixture(expectFilepath: string, content: string) {
    // eslint-disable-next-line no-process-env
    if (process.env.UPDATE_FIXTURE) {
        fs.writeFileSync(expectFilepath, content, "utf8")
    }
}
export function deleteFixture(filepath: string) {
    // eslint-disable-next-line no-process-env
    if (process.env.UPDATE_FIXTURE) {
        fs.unlinkSync(filepath)
    }
}
export function isExistsPath(filepath: string) {
    try {
        fs.statSync(filepath)
        return true
    } catch (error) {
        if (error.code === "ENOENT") {
            return false
        }
        throw error
    }
}
