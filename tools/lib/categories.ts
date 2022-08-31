import { rules } from "../../lib/utils/rules";
import type { Rule } from "../../lib/types";

const categoryTitles = {
  base: "Base Rules (Enabling Plugin)",
  "vue3-recommended": "Recommended for Vue.js 3.x",
  recommended: "Recommended for Vue.js 2.x",
} as { [key: string]: string };

const categoryConfigDescriptions = {
  base: "Enable this plugin using with:",
  "vue3-recommended": "Enforce all the rules in this category with:",
  recommended: "Enforce all the rules in this category with:",
} as { [key: string]: string };

const categoryIds = Object.keys(categoryTitles);
const categoryRules: { [key: string]: Rule[] } = rules.reduce((obj, rule) => {
  const categoryNames = rule.meta.docs.categories.length
    ? rule.meta.docs.categories
    : ["uncategorized"];
  for (const cat of categoryNames) {
    const categories = obj[cat] || (obj[cat] = []);
    categories.push(rule);
  }
  return obj;
}, {} as { [key: string]: Rule[] });

// Throw if no title is defined for a category
for (const categoryId of Object.keys(categoryRules)) {
  if (categoryId !== "uncategorized" && !categoryTitles[categoryId]) {
    throw new Error(`Category "${categoryId}" does not have a title defined.`);
  }
}

export default categoryIds.map((categoryId) => ({
  categoryId,
  title: categoryTitles[categoryId],
  configDescription: categoryConfigDescriptions[categoryId],
  rules: (categoryRules[categoryId] || []).filter(
    (rule) => !rule.meta.deprecated
  ),
}));
// .filter(category => category.rules.length >= 1)
