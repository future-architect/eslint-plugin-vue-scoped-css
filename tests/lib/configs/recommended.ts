import assert from "assert";
import plugin from "../../../lib/index";
import { ESLint } from "eslint";

const code = `<template><div class="foo"/></template> <script> ; </script> <style> bar {} </style>`;
describe("`recommended` config", () => {
  it("`recommended` config should work. ", async () => {
    const linter = new ESLint({
      overrideConfigFile: true,
      // @ts-expect-error -- typing bug
      overrideConfig: [...plugin.configs["recommended"]],
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
  it("`recommended` config with *.js should work. ", async () => {
    const linter = new ESLint({
      overrideConfigFile: true,
      // @ts-expect-error -- typing bug
      overrideConfig: [...plugin.configs["recommended"]],
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
  it("`flat/recommended` backward-compat alias should work. ", async () => {
    const linter = new ESLint({
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
});
