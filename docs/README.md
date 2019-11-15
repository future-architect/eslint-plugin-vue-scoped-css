# Introduction

[eslint-plugin-vue-scoped-css](https://www.npmjs.com/package/eslint-plugin-vue-scoped-css) is ESLint plugin for [Scoped CSS in Vue.js].

[![NPM license](https://img.shields.io/npm/l/eslint-plugin-vue-scoped-css.svg)](https://www.npmjs.com/package/eslint-plugin-vue-scoped-css)
[![NPM version](https://img.shields.io/npm/v/eslint-plugin-vue-scoped-css.svg)](https://www.npmjs.com/package/eslint-plugin-vue-scoped-css)
[![NPM downloads](https://img.shields.io/badge/dynamic/json.svg?label=downloads&colorB=green&suffix=/day&query=$.downloads&uri=https://api.npmjs.org//downloads/point/last-day/eslint-plugin-vue-scoped-css&maxAge=3600)](http://www.npmtrends.com/eslint-plugin-vue-scoped-css)
[![NPM downloads](https://img.shields.io/npm/dw/eslint-plugin-vue-scoped-css.svg)](http://www.npmtrends.com/eslint-plugin-vue-scoped-css)
[![NPM downloads](https://img.shields.io/npm/dm/eslint-plugin-vue-scoped-css.svg)](http://www.npmtrends.com/eslint-plugin-vue-scoped-css)
[![NPM downloads](https://img.shields.io/npm/dy/eslint-plugin-vue-scoped-css.svg)](http://www.npmtrends.com/eslint-plugin-vue-scoped-css)
[![NPM downloads](https://img.shields.io/npm/dt/eslint-plugin-vue-scoped-css.svg)](http://www.npmtrends.com/eslint-plugin-vue-scoped-css)
[![Build Status](https://travis-ci.com/ota-meshi/eslint-plugin-vue-scoped-css.svg?branch=master)](https://travis-ci.com/ota-meshi/eslint-plugin-vue-scoped-css)
[![Coverage Status](https://coveralls.io/repos/github/ota-meshi/eslint-plugin-vue-scoped-css/badge.svg?branch=master)](https://coveralls.io/github/ota-meshi/eslint-plugin-vue-scoped-css?branch=master)
<!--
[![Greenkeeper badge](https://badges.greenkeeper.io/ota-meshi/eslint-plugin-vue-scoped-css.svg)](https://greenkeeper.io/)
-->

## Features

This ESLint plugin provides linting rules specific to [Scoped CSS in Vue.js].

- Enforce best practices for Scoped CSS.
- Supports CSS and SCSS syntax.

You can check on the [Online DEMO](./playground/).

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
    // 'vue-scoped-css/no-unused-selector': 'error'
  }
}
```

## Configs

This plugin provides 3 predefined configs:

- `plugin:vue-scoped-css/base` - Settings and rules to enable this plugin
- `plugin:vue-scoped-css/recommended` - Above, plus rules for better ways to help you avoid problems
- `plugin:vue-scoped-css/all` - All rules of this plugin are included

## Rules

[Available Rules](./rules/README.md).

## Contributing

Welcome contributing!

Please use GitHub's Issues/PRs.

### Development Tools

- `npm test` runs tests and measures coverage.  
- `npm run update` runs in order to update readme and recommended configuration.  

## License

See the [LICENSE](LICENSE) file for license rights and limitations (MIT).

[Scoped CSS in Vue.js]: https://vue-loader.vuejs.org/guide/scoped-css.html
