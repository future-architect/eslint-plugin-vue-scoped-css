---
"eslint-plugin-vue-scoped-css": patch
---

Fix false positives in `vue-scoped-css/require-selector-used-inside` for selectors that start with ignored pseudo-classes such as `:has(...)`.
