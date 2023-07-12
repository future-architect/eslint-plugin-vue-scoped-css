const { rules } = require("../../dist/utils/rules");

const categoryTitles = {
  base: "Base Rules (Enabling Plugin)",
  recommended: "Recommended",
  "vue2-recommended": "Recommended for Vue.js 2.x",
  "vue3-recommended": "Recommended for Vue.js 3.x",
  uncategorized: "Uncategorized",
  deprecated: "Deprecated",
};

const isCategoryTest = {
  base: () => false,
  recommended: ({ deprecated, docs: { categories } }) =>
    !deprecated &&
    categories.length &&
    categories.some((cat) => cat === "recommended") &&
    categories.some((cat) => cat === "vue3-recommended"),
  "vue2-recommended": ({ deprecated, docs: { categories } }) =>
    !deprecated &&
    categories.length &&
    categories.some((cat) => cat === "recommended") &&
    categories.every((cat) => cat !== "vue3-recommended"),
  "vue3-recommended": ({ deprecated, docs: { categories } }) =>
    !deprecated &&
    categories.length &&
    categories.some((cat) => cat === "vue3-recommended") &&
    categories.every((cat) => cat !== "recommended"),
  uncategorized: ({ deprecated, docs: { categories } }) =>
    !deprecated && !categories.length,
  deprecated: ({ deprecated }) => deprecated,
};

const categoryIds = Object.keys(categoryTitles);
const categoryRules = categoryIds
  .map((cat) => [cat, rules.filter((rule) => isCategoryTest[cat](rule.meta))])
  .reduce((ret, [key, value]) => {
    ret[key] = value;
    return ret;
  }, {});

// Throw if no title is defined for a category
for (const categoryId of Object.keys(categoryRules)) {
  if (categoryId !== "uncategorized" && !categoryTitles[categoryId]) {
    throw new Error(`Category "${categoryId}" does not have a title defined.`);
  }
}

module.exports = categoryIds.map((categoryId) => ({
  categoryId,
  title: categoryTitles[categoryId],
  rules: (categoryRules[categoryId] || []).filter(
    (rule) => !rule.meta.deprecated,
  ),
}));
// .filter(category => category.rules.length >= 1)
