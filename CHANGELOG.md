# eslint-plugin-vue-scoped-css

## 3.0.0

### Major Changes

- Drop support for legacy config (eslintrc). The flat configs are now exported under the primary namespace (`base`, `recommended`, `vue2-recommended`, `all`). The `flat/*` prefixed configs are kept as backward-compatible aliases. ([#453](https://github.com/future-architect/eslint-plugin-vue-scoped-css/pull/453))

- Drop support for older Node.js versions. The new supported versions are `^20.19.0 || ^22.13.0 || >=24`. ([#451](https://github.com/future-architect/eslint-plugin-vue-scoped-css/pull/451))

- Drop support for older ESLint versions. The new minimum supported version is `>=9.38.0`. ([#448](https://github.com/future-architect/eslint-plugin-vue-scoped-css/pull/448))

- feat!: enable `v-deep-pseudo-style`, `v-global-pseudo-style`, and `v-slotted-pseudo-style` rules in `recommended` config ([#458](https://github.com/future-architect/eslint-plugin-vue-scoped-css/pull/458))

- Change to ESM-only package. Use tsdown to bundle and provide the package. ([#454](https://github.com/future-architect/eslint-plugin-vue-scoped-css/pull/454))

- fix(deps): update dependency postcss-safe-parser to v7 ([#320](https://github.com/future-architect/eslint-plugin-vue-scoped-css/pull/320))

- feat!: move preprocessor deps to peerDependencies ([#393](https://github.com/future-architect/eslint-plugin-vue-scoped-css/pull/393))

### Minor Changes

- feat: make `postcss-scss` and `postcss-styl` optional peer dependencies ([#468](https://github.com/future-architect/eslint-plugin-vue-scoped-css/pull/468))

## 2.12.0

### Minor Changes

- Add `extraClassAttributes` option to match additional class-like attributes in templates, to `vue-scoped-css/no-unused-selector` rule ([#413](https://github.com/future-architect/eslint-plugin-vue-scoped-css/pull/413))

## 2.11.0

### Minor Changes

- fix(deps): update dependency postcss-selector-parser to v7 ([#372](https://github.com/future-architect/eslint-plugin-vue-scoped-css/pull/372))

### Patch Changes

- fix: error when using ESLint v9.30.0 or later ([#400](https://github.com/future-architect/eslint-plugin-vue-scoped-css/pull/400))

## 2.10.0

### Minor Changes

- feat(TS): add types so that rules can be used in TS eslint.config files ([#394](https://github.com/future-architect/eslint-plugin-vue-scoped-css/pull/394))

## 2.9.0

### Minor Changes

- fix: Add name field to flat configs ([#380](https://github.com/future-architect/eslint-plugin-vue-scoped-css/pull/380))

## 2.8.1

### Patch Changes

- fix: vcssselector location ([#358](https://github.com/future-architect/eslint-plugin-vue-scoped-css/pull/358))

## 2.8.0

### Minor Changes

- feat: add support for flat config ([#338](https://github.com/future-architect/eslint-plugin-vue-scoped-css/pull/338))

## 2.7.2

### Patch Changes

- fix(deps): update dependency eslint-compat-utils to ^0.4.0 ([#331](https://github.com/future-architect/eslint-plugin-vue-scoped-css/pull/331))

## 2.7.1

### Patch Changes

- fix(deps): update dependency eslint-compat-utils to ^0.3.0 ([#328](https://github.com/future-architect/eslint-plugin-vue-scoped-css/pull/328))

## 2.7.0

### Minor Changes

- fix(deps): update dependency eslint-compat-utils to ^0.2.0 ([#326](https://github.com/future-architect/eslint-plugin-vue-scoped-css/pull/326))

## 2.6.1

### Patch Changes

- fix: downgrade postcss-safe-parser to v6 ([#319](https://github.com/future-architect/eslint-plugin-vue-scoped-css/pull/319))

## 2.6.0

### Minor Changes

- feat: use eslint-compat-utils ([#316](https://github.com/future-architect/eslint-plugin-vue-scoped-css/pull/316))

## 2.5.1

### Patch Changes

- fix(deps): bump postcss to 8.4.31 ([#303](https://github.com/future-architect/eslint-plugin-vue-scoped-css/pull/303))

## 2.5.0

### Minor Changes

- Improve `no-unused-selector` performance ([#285](https://github.com/future-architect/eslint-plugin-vue-scoped-css/pull/285))

## 2.4.0

### Minor Changes

- feat: improved tracking of js expression values ([#260](https://github.com/future-architect/eslint-plugin-vue-scoped-css/pull/260))

## 2.3.0

### Minor Changes

- feat: add `v-deep-pseudo-style`, `v-slotted-pseudo-style`, and `v-global-pseudo-style` rules ([#259](https://github.com/future-architect/eslint-plugin-vue-scoped-css/pull/259))

- feat: add `checkUnscoped` option to `no-unused-keyframes`, `no-unused-selector`, and `require-selector-used-inside` rules ([#255](https://github.com/future-architect/eslint-plugin-vue-scoped-css/pull/255))

- feat: support for description in directive comments ([#256](https://github.com/future-architect/eslint-plugin-vue-scoped-css/pull/256))
