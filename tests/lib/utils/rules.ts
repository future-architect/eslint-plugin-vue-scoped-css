import assert from "assert";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import { collectRules, rules as allRules } from "../../../lib/utils/rules";

/**
 * @returns {Array} Get the list of rule IDs placed in the directory.
 */
function getDirRules() {
  const rulesRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../../lib/rules",
  );
  const result = fs.readdirSync(rulesRoot);
  const ruleIds: string[] = [];
  for (const name of result) {
    const ruleName = name.replace(/\.ts$/u, "");
    const ruleId = `vue-scoped-css/${ruleName}`;
    ruleIds.push(ruleId);
  }
  return ruleIds;
}

const dirRules = getDirRules();

describe("Check if the struct of all rules is correct", () => {
  it("rule count equals (collectRules)", () => {
    const collect = collectRules();

    const deprecatedRules = allRules.filter((r) => r.meta.deprecated);
    assert.ok(
      Object.keys(collect).length + deprecatedRules.length === dirRules.length,
      `Did not equal the number of rules. expect:${dirRules.length} actual:${
        Object.keys(collect).length
      }`,
    );
  });
  it("rule count equals (rules)", () => {
    assert.ok(
      allRules.length === dirRules.length,
      `Did not equal the number of rules. expect:${dirRules.length} actual:${allRules.length}`,
    );
  });

  for (const rule of allRules) {
    it(rule.meta.docs?.ruleId || "", () => {
      assert.ok(Boolean(rule.meta.docs.ruleId), "Did not set `ruleId`");
      assert.ok(Boolean(rule.meta.docs.ruleName), "Did not set `ruleName`");
      assert.ok(
        dirRules.includes(rule.meta.docs?.ruleId || ""),
        "Did not exist rule",
      );
    });
  }
});
