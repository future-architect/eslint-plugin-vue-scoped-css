import assert from "assert";
import plugin from "../../../lib/index";
import { LegacyESLint, ESLint } from "../test-lib/eslint-compat";

const code = `<template><div class="foo"/></template> <script> ; </script> <style> bar {} </style>`;
describe("`recommended` config", () => {
  it("legacy `recommended` config should work. ", async () => {
    const linter = new LegacyESLint({
      plugins: {
        "vue-scoped-css": plugin as never,
      },
      baseConfig: {
        parserOptions: {
          ecmaVersion: 2020,
        },
        extends: ["plugin:vue-scoped-css/vue3-recommended"],
      },
      useEslintrc: false,
    });
    const result = await linter.lintText(code, { filePath: "test.vue" });
    const messages = result[0].messages;

    assert.deepStrictEqual(
      messages.map((m) => ({
        ruleId: m.ruleId,
        line: m.line,
        message: m.message,
      })),
      [
        {
          message: "Missing attribute `scoped`.",
          ruleId: "vue-scoped-css/enforce-style-type",
          line: 1,
        },
      ],
    );
  });
  it("`flat/recommended` config should work. ", async () => {
    const linter = new ESLint({
      // @ts-expect-error -- typing bug
      overrideConfigFile: true,
      // @ts-expect-error -- typing bug
      overrideConfig: [...plugin.configs["flat/recommended"]],
    });
    const result = await linter.lintText(code, { filePath: "test.vue" });
    const messages = result[0].messages;

    assert.deepStrictEqual(
      messages.map((m) => ({
        ruleId: m.ruleId,
        line: m.line,
        message: m.message,
      })),
      [
        {
          message: "Missing attribute `scoped`.",
          ruleId: "vue-scoped-css/enforce-style-type",
          line: 1,
        },
      ],
    );
  });
  it("`flat/recommended` config with *.js should work. ", async () => {
    const linter = new ESLint({
      // @ts-expect-error -- typing bug
      overrideConfigFile: true,
      // @ts-expect-error -- typing bug
      overrideConfig: [...plugin.configs["flat/recommended"]],
    });

    const result = await linter.lintText(";", { filePath: "test.js" });
    const messages = result[0].messages;

    assert.deepStrictEqual(
      messages.map((m) => ({
        ruleId: m.ruleId,
        line: m.line,
        message: m.message,
      })),
      [],
    );
  });
});
