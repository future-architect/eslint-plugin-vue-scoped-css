import path from "path"
import fs from "fs"
import os from "os"
import { rules } from "./lib/load-rules"
import categories from "./lib/categories"
import { Rule } from "../lib/types"
const isWin = os.platform().startsWith("win")

const uncategorizedRules = rules.filter(
    rule => !rule.meta.docs.category && !rule.meta.deprecated,
)
const deprecatedRules = rules.filter(rule => rule.meta.deprecated)

//eslint-disable-next-line require-jsdoc
function toRuleRow(rule: Rule) {
    const mark = `${rule.meta.fixable ? ":wrench:" : ""}${
        rule.meta.deprecated ? ":warning:" : ""
    }`
    const link = `[${rule.meta.docs.ruleId}](./docs/rules/${rule.meta.docs.ruleName}.md)`
    const description = rule.meta.docs.description || "(no description)"

    return `| ${mark} | ${link} | ${description} |`
}

//eslint-disable-next-line require-jsdoc
function toDeprecatedRuleRow(rule: Rule) {
    const link = `[${rule.meta.docs.ruleId}](./docs/rules/${rule.meta.docs.ruleName}.md)`
    const replacedRules = rule.meta.docs.replacedBy || []
    const replacedBy = replacedRules
        .map(name => `[vue-scoped-css/${name}](./docs/rules/${name}.md)`)
        .join(", ")

    return `| ${link} | ${replacedBy || "(no replacement)"} |`
}

let rulesTableContent = categories
    .map(
        category => `
### ${category.title}

${category.configDescription}

\`\`\`json
{
  "extends": "plugin:vue-scoped-css/${category.categoryId}"
}
\`\`\`
${
    category.rules.length
        ? `
|    | Rule ID | Description |
|:---|:--------|:------------|
${category.rules.map(toRuleRow).join("\n")}
`
        : ""
}`,
    )
    .join("")

if (uncategorizedRules.length >= 1) {
    rulesTableContent += `
### Uncategorized

|    | Rule ID | Description |
|:---|:--------|:------------|
${uncategorizedRules.map(toRuleRow).join("\n")}
`
}

if (deprecatedRules.length >= 1) {
    rulesTableContent += `
### Deprecated

> - :warning: We're going to remove deprecated rules in the next major release. Please migrate to successor/new rules.
> - :innocent: We don't fix bugs which are in deprecated rules since we don't have enough resources.

| Rule ID | Replaced by |
|:--------|:------------|
${deprecatedRules.map(toDeprecatedRuleRow).join("\n")}
`
}

let insertText = `\n${rulesTableContent}\n`
if (isWin) {
    insertText = insertText
        .replace(/\r?\n/gu, "\n")
        .replace(/\r/gu, "\n")
        .replace(/\n/gu, "\r\n")
}

const readmeFilePath = path.resolve(__dirname, "../README.md")
const newReadme = fs
    .readFileSync(readmeFilePath, "utf8")
    .replace(
        /<!--RULES_TABLE_START-->[\s\S]*<!--RULES_TABLE_END-->/u,
        `<!--RULES_TABLE_START-->${insertText}<!--RULES_TABLE_END-->`,
    )
fs.writeFileSync(readmeFilePath, newReadme)

const docsReadmeFilePath = path.resolve(__dirname, "../docs/README.md")

fs.writeFileSync(
    docsReadmeFilePath,
    newReadme
        .replace("# eslint-plugin-vue-scoped-css\n", "# Introduction\n")
        .replace(
            /<!--RULES_SECTION_START-->[\s\S]*<!--RULES_SECTION_END-->/u,
            "[Available Rules](./rules/README.md).",
        )
        .replace(
            /<!--DOCS_IGNORE_START-->([\s\S]*?)<!--DOCS_IGNORE_END-->/gu,
            "",
        )
        .replace(
            /\(https:\/\/ota-meshi.github.io\/eslint-plugin-vue-scoped-css/gu,
            "(.",
        )
        .replace(/\n\n\n+/gu, "\n\n"),
)
