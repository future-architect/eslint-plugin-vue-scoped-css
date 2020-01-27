# User Guide

## Installation

```bash
npm install --save-dev eslint eslint-plugin-vue-scoped-css
```

::: tip Requirements
- ESLint v5.0.0 and above
- Node.js v8.10.0 and above
:::

## Usage

### Configuration

Use `.eslintrc.*` file to configure rules. See also: [https://eslint.org/docs/user-guide/configuring](https://eslint.org/docs/user-guide/configuring).

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

This plugin provides 3 predefined configs:

- `plugin:vue-scoped-css/base` - Settings and rules to enable this plugin
- `plugin:vue-scoped-css/recommended` - Above, plus rules for better ways to help you avoid problems
- `plugin:vue-scoped-css/all` - All rules of this plugin are included

See [the rule list](../rules/README.md) to get the `rules` that this plugin provides.

### Running ESLint from command line

If you want to run `eslint` from command line, make sure you include the `.vue` extension using [the `--ext` option](https://eslint.org/docs/user-guide/configuring#specifying-file-extensions-to-lint) or a glob pattern because ESLint targets only `.js` files by default.

Examples:

```bash
eslint --ext .js,.vue src
eslint "src/**/*.{js,vue}"
```

#### How to use custom parser?

If you want to use custom parsers such as [babel-eslint](https://www.npmjs.com/package/babel-eslint) or [@typescript-eslint/parser](https://www.npmjs.com/package/@typescript-eslint/parser), you have to use `parserOptions.parser` option instead of `parser` option. Because this plugin requires [vue-eslint-parser](https://www.npmjs.com/package/vue-eslint-parser) to parse `.vue` files, so this plugin doesn't work if you overwrote `parser` option.

```diff
- "parser": "babel-eslint",
+ "parser": "vue-eslint-parser",
  "parserOptions": {
+     "parser": "babel-eslint",
      "sourceType": "module"
  }
```

### How ESLint detects components?

All component-related rules are being applied to code that passes any of the following checks:

* `export default {}` in `.vue` file

If you however want to take advantage of our rules in any of your custom objects that are Vue components, you might need to use special comment `// @vue/component` that marks object in the next line as a Vue component in any file, e.g.:

```js
// @vue/component
const CustomComponent = {
  name: 'custom-component',
  template: '<div></div>'
}
```

### Disabling rules via `/* eslint-disable */`

You can use `/* eslint-disable */`-like CSS comments in `<style>` of `.vue` files to disable a certain rule temporarily.

For example:

<eslint-code-block :rules="{'vue-scoped-css/no-unused-selector': ['error']}">

```vue
<template>
  <div />
</template>
<style scoped>
/* eslint-disable-next-line vue-scoped-css/no-unused-selector */
.unknown {
  color: red;
}
</style>
```

</eslint-code-block>

## Editor integrations

#### Visual Studio Code

Use [dbaeumer.vscode-eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) extension that Microsoft provides officially.

You have to configure the `eslint.validate` option of the extension to check `.vue` files because the extension targets only `*.js` or `*.jsx` files by default.

Example **.vscode/settings.json**:

```json
{
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "vue",
  ]
}
```

#### Sublime Text

Use [SublimeLinter-eslint](https://github.com/SublimeLinter/SublimeLinter-eslint) extension that SublimeLinter provides for eslint.

You have to open command-palette via `Cmd/Ctrl+Shift+P` and type `Preferences: SublimeLinter Settings`, paste to the config on the right side:

```json
{
  "linters": {
    "eslint": {
      "selector": "text.html.vue, source.js - meta.attribute-with-value"
    }
  }
}
```

#### Atom editor

You need to go into `Settings -> Packages -> linter-eslint`, under the option "List of scopes to run eslint on", add `text.html.vue`. You may need to restart Atom.

#### IntelliJ IDEA / JetBrains WebStorm

In the **Settings/Preferences** dialog (`Cmd+,`/`Ctrl+Alt+S`), choose JavaScript under **Languages and Frameworks** and then choose **ESLint** under **Code Quality Tools**.
On the **ESLint page** that opens, select the *Enable* checkbox.

If your ESLint configuration is updated (manually or from your version control), open it in the editor and choose **Apply ESLint Code Style Rules** on the context menu.

read more: [JetBrains - ESLint](https://www.jetbrains.com/help/idea/eslint.html)

## FAQ

### What is the "Use the latest vue-eslint-parser" error?

The most rules of `eslint-plugin-vue-scoped-css` require `vue-eslint-parser` to check `<template>` ASTs.

Make sure you have one of the following settings in your **.eslintrc**:

- `"extends": ["plugin:vue-scoped-css/recommended"]`
- `"extends": ["plugin:vue-scoped-css/base"]`
- `"extends": ["plugin:vue/recommended"]`
- `"extends": ["plugin:vue/base"]`

If you already use other parser (e.g. `"parser": "babel-eslint"`), please move it into `parserOptions`, so it doesn't collide with the `vue-eslint-parser` used by this plugin's configuration:

```diff
- "parser": "babel-eslint",
  "parserOptions": {
+     "parser": "babel-eslint",
      "ecmaVersion": 2017,
      "sourceType": "module"
  }
```

See also: "[How to use custom parser?](#how-to-use-custom-parser)" section.

### Why doesn't it work on .vue file?

1. Make sure you don't have `eslint-plugin-html` in your config. The `eslint-plugin-html` extracts the content from `<script>` tags, but `eslint-plugin-vue` requires `<script>` tags and `<template>` tags in order to distinguish template and script in single file components.

  ```diff
    "plugins": [
      "vue",
  -   "html"
    ]
  ```

2. Make sure your tool is set to lint `.vue` files.
  - CLI targets only `.js` files by default. You have to specify additional extensions by `--ext` option or glob patterns. E.g. `eslint "src/**/*.{js,vue}"` or `eslint src --ext .vue`.
  - If you are having issues with configuring editor please read [editor integrations](#editor-integrations)
