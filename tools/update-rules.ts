import path from "path";
import fs from "fs";
import os from "os";
import { fileURLToPath } from "url";
// import eslint from "eslint"
import { rules } from "./lib/load-rules";
const isWin = os.platform().startsWith("win");

/**
 * Convert kebab-case to camelCase
 */
function toCamelCase(name: string): string {
  return name.replace(/-([a-z])/gu, (_, c) => c.toUpperCase());
}

let content = `
import type { Rule } from "../types";
${rules
  .map(
    (rule) =>
      `import ${toCamelCase(rule.meta.docs.ruleName)} from "../rules/${
        rule.meta.docs.ruleName
      }";`,
  )
  .join("\n")}

const baseRules = [
    ${rules
      .map(
        (rule) => `{
    rule: ${toCamelCase(rule.meta.docs.ruleName)},
    ruleName: "${rule.meta.docs.ruleName}",
    ruleId: "${rule.meta.docs.ruleId}",
    },
    `,
      )
      .join("")}
]

export const rules = baseRules.map(obj => {
    const rule = obj.rule
    rule.meta.docs.ruleName = obj.ruleName
    rule.meta.docs.ruleId = obj.ruleId
    return rule as Rule
})

/**
 * Collect the rules
 * @param {string} category category
 * @returns {Array} rules
 */
export function collectRules(
    category?: "vue2-recommended" | "vue3-recommended",
): { [key: string]: string } {
    return rules.reduce((obj, rule) => {
        if (
            (!category || rule.meta.docs.categories.includes(category)) &&
            !rule.meta.deprecated
        ) {
            obj[rule.meta.docs.ruleId || ""] = rule.meta.docs.default || "error"
        }
        return obj
    }, {} as { [key: string]: string })
}
`;

const filePath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../lib/utils/rules.ts",
);

if (isWin) {
  content = content
    .replace(/\r?\n/gu, "\n")
    .replace(/\r/gu, "\n")
    .replace(/\n/gu, "\r\n");
}

// Update file.
fs.writeFileSync(filePath, content);

// Format files.
// const linter = new eslint.CLIEngine({ fix: true })
// const report = linter.executeOnFiles([filePath])
// eslint.CLIEngine.outputFixes(report)
