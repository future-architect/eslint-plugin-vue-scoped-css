# eslint-plugin-vue-scoped-css

[eslint-plugin-vue-scoped-css](https://www.npmjs.com/package/eslint-plugin-vue-scoped-css) is ESLint plugin for [Scoped CSS in Vue.js].

[![NPM license](https://img.shields.io/npm/l/eslint-plugin-vue-scoped-css.svg)](https://www.npmjs.com/package/eslint-plugin-vue-scoped-css)
[![NPM version](https://img.shields.io/npm/v/eslint-plugin-vue-scoped-css.svg)](https://www.npmjs.com/package/eslint-plugin-vue-scoped-css)
[![NPM downloads](https://img.shields.io/badge/dynamic/json.svg?label=downloads&colorB=green&suffix=/day&query=$.downloads&uri=https://api.npmjs.org//downloads/point/last-day/eslint-plugin-vue-scoped-css&maxAge=3600)](http://www.npmtrends.com/eslint-plugin-vue-scoped-css)
[![NPM downloads](https://img.shields.io/npm/dw/eslint-plugin-vue-scoped-css.svg)](http://www.npmtrends.com/eslint-plugin-vue-scoped-css)
[![NPM downloads](https://img.shields.io/npm/dm/eslint-plugin-vue-scoped-css.svg)](http://www.npmtrends.com/eslint-plugin-vue-scoped-css)
[![NPM downloads](https://img.shields.io/npm/dy/eslint-plugin-vue-scoped-css.svg)](http://www.npmtrends.com/eslint-plugin-vue-scoped-css)
[![NPM downloads](https://img.shields.io/npm/dt/eslint-plugin-vue-scoped-css.svg)](http://www.npmtrends.com/eslint-plugin-vue-scoped-css)
<!--
[![Build Status](https://travis-ci.org/ota-meshi/eslint-plugin-vue-scoped-css.svg?branch=master)](https://travis-ci.org/ota-meshi/eslint-plugin-vue-scoped-css)
[![Coverage Status](https://coveralls.io/repos/github/ota-meshi/eslint-plugin-vue-scoped-css/badge.svg?branch=master)](https://coveralls.io/github/ota-meshi/eslint-plugin-vue-scoped-css?branch=master)
[![Greenkeeper badge](https://badges.greenkeeper.io/ota-meshi/eslint-plugin-vue-scoped-css.svg)](https://greenkeeper.io/)
-->

## Features

This ESLint plugin provides linting rules specific to [Scoped CSS in Vue.js].

You can check on the [Online DEMO](https://ota-meshi.github.io/eslint-plugin-vue-scoped-css/playground/).

<!--DOCS_IGNORE_START-->

## Documentation

See [documents](https://ota-meshi.github.io/eslint-plugin-vue-scoped-css/).

<!--DOCS_IGNORE_END-->

## Installation

```bash
npm install --save-dev eslint-plugin-vue-scoped-css
```

## Usage

Create `.eslintrc.*` file to configure rules. See also: [http://eslint.org/docs/user-guide/configuring](http://eslint.org/docs/user-guide/configuring).

Example **.eslintrc.js**:

```js
module.exports = {
  extends: [
    // add more generic rulesets here, such as:
    // 'eslint:recommended',
    'plugin:vue-scoped-css/recommended'
  ],
  rules: {
    // override/add rules settings here, such as:
    // 'vue-scoped-css/no-warning-html-comments': 'error'
  }
}
```

## Configs

This plugin provides 3 predefined configs:

- `plugin:vue-scoped-css/base` - Settings and rules to enable correct ESLint parsing
- `plugin:vue-scoped-css/recommended` - Above, plus rules to improve code experience
- `plugin:vue-scoped-css/all` - All rules of this plugin are included

## Rules

<!--RULES_SECTION_START-->

The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) automatically fixes problems reported by rules which have a wrench :wrench: below.

<!--RULES_TABLE_START-->

### Base Rules (Enabling Correct ESLint Parsing)

Enable this plugin using with:

```json
{
  "extends": "plugin:vue-scoped-css/base"
}
```

### Recommended (Improve Development Experience)

Enforce all the rules in this category with:

```json
{
  "extends": "plugin:vue-scoped-css/recommended"
}
```

|    | Rule ID | Description |
|:---|:--------|:------------|
|  | [vue-scoped-css/no-unused-selector](./docs/rules/no-unused-selector.md) | Reports selectors defined in Scoped CSS not used in `<template>`. |
|  | [vue-scoped-css/require-scoped](./docs/rules/require-scoped.md) | Enforce the `<style>` tags to has the `scoped` attribute. |

### Uncategorized

|    | Rule ID | Description |
|:---|:--------|:------------|
|  | [vue-scoped-css/require-selector-used-inside](./docs/rules/require-selector-used-inside.md) | Reports the defined selectors is not used inside `<template>`. |

<!--RULES_TABLE_END-->
<!--RULES_SECTION_END-->

## Contributing

Welcome contributing!

Please use GitHub's Issues/PRs.

### Development Tools

- `npm test` runs tests and measures coverage.  
- `npm run update` runs in order to update readme and recommended configuration.  

## License

See the [LICENSE](LICENSE) file for license rights and limitations (MIT).

[Scoped CSS in Vue.js]: https://vue-loader.vuejs.org/guide/scoped-css.html
