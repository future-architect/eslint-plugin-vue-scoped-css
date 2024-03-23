import { rules } from "../../lib/utils/rules";
import type { Rule } from "../../lib/types";

export const FLAT_PRESETS = {
  "vue2-recommended": "flat/vue2-recommended",
  "vue3-recommended": "flat/recommended",
  base: "flat/base",
  uncategorized: null,
};
export const LEGACY_PRESETS = {
  "vue2-recommended": "plugin:vue-scoped-css/recommended",
  "vue3-recommended": "plugin:vue-scoped-css/vue3-recommended",
  base: "plugin:vue-scoped-css/base",
  uncategorized: null,
};

const categoryTitles = {
  base: "Base Rules (Enabling Plugin)",
  "vue3-recommended": "Recommended for Vue.js 3.x",
  "vue2-recommended": "Recommended for Vue.js 2.x",
  uncategorized: undefined,
};

const categoryConfigDescriptions = {
  base: "Enable this plugin using with:",
  "vue3-recommended": "Enforce all the rules in this category with:",
  "vue2-recommended": "Enforce all the rules in this category with:",
  uncategorized: undefined,
};

type CategoryId = keyof typeof categoryTitles;

const categoryIds: CategoryId[] = [
  "base",
  "vue3-recommended",
  "vue2-recommended",
];
const categoryRules: Record<CategoryId, Rule[]> = rules.reduce(
  (obj, rule) => {
    const categoryNames: CategoryId[] = rule.meta.docs.categories.length
      ? rule.meta.docs.categories
      : ["uncategorized"];
    for (const cat of categoryNames) {
      const categories = obj[cat] || (obj[cat] = []);
      categories.push(rule);
    }
    return obj;
  },
  {} as Record<CategoryId, Rule[]>,
);

// Throw if no title is defined for a category
for (const categoryId of Object.keys(categoryRules)) {
  if (
    categoryId !== "uncategorized" &&
    !categoryTitles[categoryId as CategoryId]
  ) {
    throw new Error(`Category "${categoryId}" does not have a title defined.`);
  }
}

export default categoryIds.map((categoryId) => ({
  categoryId,
  title: categoryTitles[categoryId],
  configDescription: categoryConfigDescriptions[categoryId],
  rules: (categoryRules[categoryId] || []).filter(
    (rule) => !rule.meta.deprecated,
  ),
}));
// .filter(category => category.rules.length >= 1)
