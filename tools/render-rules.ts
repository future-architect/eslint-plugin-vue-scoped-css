import categories from "./lib/categories";
import type { Rule } from "../lib/types";
import { rules } from "../lib/utils/rules";

//eslint-disable-next-line require-jsdoc -- tools
export default function renderRulesTableContent(
  buildRulePath = (ruleName: string) => `./${ruleName}.md`,
): string {
  const uncategorizedRules = rules.filter(
    (rule) => !rule.meta.docs.categories.length && !rule.meta.deprecated,
  );
  const deprecatedRules = rules.filter((rule) => rule.meta.deprecated);

  // -----------------------------------------------------------------------------

  //eslint-disable-next-line require-jsdoc -- tools
  function toRuleRow(rule: Rule) {
    const mark = `${rule.meta.fixable ? ":wrench:" : ""}${
      rule.meta.deprecated ? ":warning:" : ""
    }`;
    const link = `[${rule.meta.docs.ruleId}](${buildRulePath(
      rule.meta.docs.ruleName || "",
    )})`;
    const description = rule.meta.docs.description || "(no description)";

    return `| ${link} | ${description} | ${mark} |`;
  }

  //eslint-disable-next-line require-jsdoc -- tools
  function toDeprecatedRuleRow(rule: Rule) {
    const link = `[${rule.meta.docs.ruleId}](${buildRulePath(
      rule.meta.docs.ruleName || "",
    )})`;
    const replacedRules = rule.meta.docs.replacedBy || [];
    const replacedBy = replacedRules
      .map((name) => `[vue-scoped-css/${name}](${buildRulePath(name)}.md)`)
      .join(", ");

    return `| ${link} | ${replacedBy || "(no replacement)"} |`;
  }

  // -----------------------------------------------------------------------------
  let rulesTableContent = categories
    .map((category) =>
      category.rules.length
        ? `
## ${category.title}

${category.configDescription}

\`\`\`json
{
  "extends": "plugin:vue-scoped-css/${category.categoryId}"
}
\`\`\`

| Rule ID | Description |    |
|:--------|:------------|:---|
${category.rules.map(toRuleRow).join("\n")}
`
        : "",
    )
    .join("");

  // -----------------------------------------------------------------------------
  if (uncategorizedRules.length >= 1) {
    rulesTableContent += `
## Uncategorized

No preset enables the rules in this category.
Please enable each rule if you want.

For example:

\`\`\`json
{
  "rules": {
    "${uncategorizedRules[0].meta.docs.ruleId}": "error"
  }
}
\`\`\`

| Rule ID | Description |    |
|:--------|:------------|:---|
${uncategorizedRules.map(toRuleRow).join("\n")}
`;
  }

  // -----------------------------------------------------------------------------
  if (deprecatedRules.length >= 1) {
    rulesTableContent += `
## Deprecated

- :warning: We're going to remove deprecated rules in the next major release. Please migrate to successor/new rules.
- :innocent: We don't fix bugs which are in deprecated rules since we don't have enough resources.

| Rule ID | Replaced by |
|:--------|:------------|
${deprecatedRules.map(toDeprecatedRuleRow).join("\n")}
`;
  }
  return rulesTableContent;
}
