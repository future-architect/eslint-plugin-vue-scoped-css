import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const _require = createRequire(import.meta.url);

/**
 * Get the all rules
 * @returns {Array} The all rules
 */
function readRules() {
  // const rulesDistRoot = path.resolve(dirname, "../../dist/rules")
  const rulesLibRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../lib/rules",
  );
  const result = fs.readdirSync(rulesLibRoot);
  const rules = [];
  for (const name of result) {
    const ruleName = name.replace(/\.ts$/u, "");
    const ruleId = `vue-scoped-css/${ruleName}`;
    const ruleModule = _require(path.join(rulesLibRoot, name));
    const rule = ruleModule.default ?? ruleModule;

    rule.meta.docs.ruleName = ruleName;
    rule.meta.docs.ruleId = ruleId;

    rules.push(rule);
  }
  return rules;
}

export const rules = readRules();
