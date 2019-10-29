import path from "path"
import fs from "fs"
const logger = console

    // main
;(ruleId => {
    if (ruleId == null) {
        logger.error("Usage: npm run new <RuleID>")
        process.exitCode = 1
        return
    }
    if (!/^[\w-]+$/u.test(ruleId)) {
        logger.error("Invalid RuleID '%s'.", ruleId)
        process.exitCode = 1
        return
    }

    const ruleFile = path.resolve(__dirname, `../lib/rules/${ruleId}.ts`)
    const testFile = path.resolve(__dirname, `../tests/lib/rules/${ruleId}.js`)
    const docFile = path.resolve(__dirname, `../docs/rules/${ruleId}.md`)

    fs.writeFileSync(
        ruleFile,
        `
import {
    getStyleContexts,
    getCommentDirectivesReporter,
    StyleContext,
} from "../styles"
import { VCSSSelectorNode } from "../styles/ast"
import { RuleContext } from "../types"

module.exports = {
    meta: {
        docs: {
            description: "",
            category: undefined,
            default: "warn",
            url: "",
        },
        fixable: null,
        schema: [],
        messages: {
        }
    },
    create(context: RuleContext) {
        const styles = getStyleContexts(context).filter(
            style => !style.invalid && style.scoped,
        )
        if (!styles.length) {
            return {}
        }
        const reporter = getCommentDirectivesReporter(context)


        /**
         * Reports the given node
         * @param {ASTNode} node node to report
         */
        function report(node: VCSSSelectorNode) {
            reporter.report({
                node,
                loc: node.loc,
                messageId: "???",
                data: {}
            })
        }


        return {
            "Program:exit"() {
                // const queryContext = createQueryContext(
                //     context,
                //     context.options[0] || {},
                // )
                //
                // for (const style of styles) {
                //     for (const scopedSelector of getScopedSelectors(style)) {
                //         verifySelector(queryContext, scopedSelector)
                //     }
                // }
            },
        }
    },
}
`,
    )
    fs.writeFileSync(
        testFile,
        `"use strict"

const RuleTester = require("eslint").RuleTester
const rule = require("../../../dist/rules/${ruleId}")

const tester = new RuleTester({
    parser: require.resolve("vue-eslint-parser"),
    parserOptions: {
        ecmaVersion: 2019,
        sourceType: "module",
    },
})

tester.run("${ruleId}", rule, {
    valid: [
        \`
        <template>
            <div class="item">sample</div>
        </template>
        <style scoped>
        .item {}
        </style>
        \`
    ],
    invalid: [
        {
            code: \`
            <template>
                <div class="item">sample</div>
            </template>
            <style scoped>
            .item {}
            </style>
            \`,
            errors: [
                {
                    messageId: "unused",
                    data: {},
                    line: 1,
                    column: 1,
                    endLine: 1,
                    endColumn: 1,
                },
            ],
        },
    ],
})
`,
    )
    fs.writeFileSync(
        docFile,
        `#  (vue-scoped-css/${ruleId})

## :book: Rule Details

This rule reports ??? as errors.

<eslint-code-block :rules="{'vue-scoped-css/${ruleId}': ['error']}">

\`\`\`vue
<template>
  <div class="item"></div>
</template>
<style scoped>
/* ✗ BAD */
.item {}

/* ✓ GOOD */
.item {}
</style>
\`\`\`

</eslint-code-block>

## :wrench: Options

\`\`\`json
{
  "vue-scoped-css/${ruleId}": ["error", {
   
  }]
}
\`\`\`

- 

## :books: Further reading

- None

`,
    )
})(process.argv[2])
