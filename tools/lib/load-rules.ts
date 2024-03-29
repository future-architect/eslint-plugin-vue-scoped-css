import path from "path";
import fs from "fs";

/**
 * Get the all rules
 * @returns {Array} The all rules
 */
function readRules() {
  // const rulesDistRoot = path.resolve(__dirname, "../../dist/rules")
  const rulesLibRoot = path.resolve(__dirname, "../../lib/rules");
  const result = fs.readdirSync(rulesLibRoot);
  const rules = [];
  for (const name of result) {
    const ruleName = name.replace(/\.ts$/u, "");
    const ruleId = `vue-scoped-css/${ruleName}`;
    const rule = require(path.join(rulesLibRoot, name));

    rule.meta.docs.ruleName = ruleName;
    rule.meta.docs.ruleId = ruleId;

    rules.push(rule);
  }
  return rules;
}

export const rules = readRules();
