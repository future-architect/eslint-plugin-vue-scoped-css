import path from "path";
import fs from "fs";
import cp from "child_process";
const logger = console;

// main
((ruleId) => {
  if (ruleId == null) {
    logger.error("Usage: npm run new <RuleID>");
    process.exitCode = 1;
    return;
  }
  if (!/^[\w-]+$/u.test(ruleId)) {
    logger.error("Invalid RuleID '%s'.", ruleId);
    process.exitCode = 1;
    return;
  }

  const ruleFile = path.resolve(__dirname, `../lib/rules/${ruleId}.ts`);
  const testFile = path.resolve(__dirname, `../tests/lib/rules/${ruleId}.ts`);
  const docFile = path.resolve(__dirname, `../docs/rules/${ruleId}.md`);

  fs.writeFileSync(
    ruleFile,
    `
import {
    getStyleContexts,
    getCommentDirectivesReporter,
    isValidStyleContext,
} from "../styles/context"
import type { VCSSSelectorNode } from "../styles/ast"
import type { RuleContext, RuleListener } from "../types"

export = {
    meta: {
        docs: {
            description: "",
            categories: [''],
            default: "warn",
            url: "",
        },
        fixable: null,
        schema: [],
        messages: {
        },
        type: "suggestion", // "problem",
    },
    create(context: RuleContext): RuleListener {
        const styles = getStyleContexts(context)
            .filter(isValidStyleContext)
            .filter((style) => style.scoped)
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
  );
  fs.writeFileSync(
    testFile,
    `import { RuleTester } from "../test-lib/eslint-compat"
import rule = require("../../../lib/rules/${ruleId}")
import * as vueParser from "vue-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: vueParser,
    ecmaVersion: 2019,
    sourceType: "module",
  },
})

tester.run("${ruleId}", rule as any, {
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
  );
  fs.writeFileSync(
    docFile,
    `#  (vue-scoped-css/${ruleId})

> foo

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
  );
  cp.execSync(`code "${ruleFile}"`);
  cp.execSync(`code "${testFile}"`);
  cp.execSync(`code "${docFile}"`);
})(process.argv[2]);
