import { Linter } from "eslint/lib/linter";
import plugin from "../../../../";
import pluginVue from "eslint-plugin-vue";

const coreRules = Object.fromEntries(new Linter().getRules());

const CATEGORY_TITLES = {
  base: "Base Rules",
  recommended: "Recommended",
  "vue2-recommended": "Recommended for Vue.js 2.x",
  "vue3-recommended": "Recommended for Vue.js 3.x",
  uncategorized: "Uncategorized",
  "eslint-plugin-vue": "eslint-plugin-vue rules",
  "eslint-core-rules@problem": "ESLint core rules(Possible Errors)",
  "eslint-core-rules@suggestion": "ESLint core rules(Suggestions)",
  "eslint-core-rules@layout": "ESLint core rules(Layout & Formatting)",
};
const CATEGORY_INDEX = {
  base: 0,
  recommended: 1,
  "vue2-recommended": 2,
  "vue3-recommended": 3,
  uncategorized: 4,
  "eslint-plugin-vue": 5,
  "eslint-core-rules@problem": 20,
  "eslint-core-rules@suggestion": 21,
  "eslint-core-rules@layout": 22,
};
const CATEGORY_CLASSES = {
  base: "eslint-plugin-vue-scoped-css-category",
  recommended: "eslint-plugin-vue-scoped-css-category",
  "vue2-recommended": "eslint-plugin-vue-scoped-css-category",
  "vue3-recommended": "eslint-plugin-vue-scoped-css-category",
  uncategorized: "eslint-plugin-vue-scoped-css-category",
  "eslint-plugin-vue": "eslint-plugin-vue-category",
  "eslint-core-rules@problem": "eslint-core-category",
  "eslint-core-rules@suggestion": "eslint-core-category",
  "eslint-core-rules@layout": "eslint-core-category",
};

function getCategory({ deprecated, docs: { categories } }) {
  if (deprecated) {
    return "deprecated";
  }
  const v2 = categories.some((cat) => cat === "recommended");
  const v3 = categories.some((cat) => cat === "vue3-recommended");
  if (v2) {
    return v3 ? "recommended" : "vue2-recommended";
  } else if (v3) {
    return "vue3-recommended";
  }
  return "uncategorized";
}

const allRules = [];

for (const k of Object.keys(plugin.rules)) {
  const rule = plugin.rules[k];
  if (rule.meta.deprecated) {
    continue;
  }
  const category = getCategory(rule.meta);
  allRules.push({
    classes: "eslint-plugin-vue-scoped-css-rule",
    category,
    ruleId: rule.meta.docs.ruleId,
    url: rule.meta.docs.url,
    init: CATEGORY_INDEX[category] <= 3 ? "error" : "off",
  });
}
for (const k of Object.keys(pluginVue.rules)) {
  const rule = pluginVue.rules[k];
  allRules.push({
    classes: "eslint-plugin-vue-rule",
    category: "eslint-plugin-vue",
    ruleId: `vue/${k}`,
    url: rule.meta.docs.url,
    init: "off",
  });
}
for (const k of Object.keys(coreRules)) {
  const rule = coreRules[k];
  if (rule.meta.deprecated) {
    continue;
  }
  allRules.push({
    classes: "eslint-core-rule",
    category: `eslint-core-rules@${rule.meta.type}`,
    ruleId: k,
    url: rule.meta.docs.url,
    init: plugin.configs.recommended.rules[k] || "off",
  });
}

allRules.sort((a, b) =>
  a.ruleId > b.ruleId ? 1 : a.ruleId < b.ruleId ? -1 : 0,
);

export const categories = [];

for (const rule of allRules) {
  const title = CATEGORY_TITLES[rule.category];
  let category = categories.find((c) => c.title === title);
  if (!category) {
    category = {
      classes: CATEGORY_CLASSES[rule.category],
      category: rule.category,
      categoryOrder: CATEGORY_INDEX[rule.category],
      title,
      rules: [],
    };
    categories.push(category);
  }
  category.rules.push(rule);
}
categories.sort((a, b) =>
  a.categoryOrder > b.categoryOrder
    ? 1
    : a.categoryOrder < b.categoryOrder
      ? -1
      : a.title > b.title
        ? 1
        : a.title < b.title
          ? -1
          : 0,
);

export const DEFAULT_RULES_CONFIG = allRules.reduce((c, r) => {
  if (r.ruleId === "vue/no-parsing-error") {
    c[r.ruleId] = "error";
  } else {
    c[r.ruleId] = r.init;
  }
  return c;
}, {});

export const rules = allRules;

export function getRule(ruleId) {
  if (!ruleId) {
    return null;
  }
  for (const category of categories) {
    for (const rule of category.rules) {
      if (rule.ruleId === ruleId) {
        return rule;
      }
    }
  }
  return {
    ruleId,
    url: "",
    classes: "",
  };
}
