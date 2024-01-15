import { getLinter } from "eslint-compat-utils/linter";
import assert from "assert";
import plugin from "../../lib/index";
import type * as eslint from "eslint";
import * as vueParser from "vue-eslint-parser";

// eslint-disable-next-line @typescript-eslint/naming-convention -- Class name
const Linter = getLinter();
type LinterMessages = Partial<eslint.Linter.LintMessage>;

/**
 * Assert the messages
 * @param {Array} actual The actual messages
 * @param {Array} expected The expected messages
 * @returns {void}
 */
function assertMessages(actual: LinterMessages[], expected: LinterMessages[]) {
  const length = Math.max(actual.length, expected.length);
  const expected2: LinterMessages[] = [];
  for (let i = 0; i < length; i++) {
    expected2.push(
      expected[i] ? { ...actual[i], ...expected[i] } : expected[i],
    );
  }

  assert.deepStrictEqual(actual, expected2);
  assert.strictEqual(actual.length, expected.length);
}

describe("reporter test", () => {
  it("The report must be valid.", () => {
    const linter = new Linter();
    const config = {
      files: ["*", "*.vue", "**/*.vue"],
      languageOptions: { parser: vueParser, ecmaVersion: 2015 },
      rules: {
        "vue-scoped-css/no-unused-selector": "error",
        "vue-scoped-css/require-selector-used-inside": "error",
      },
      plugins: {
        "vue-scoped-css": plugin,
      },
    };

    const messages = linter.verify(
      "<template><input></template><style scoped> .a {} /* */ </style>",
      config as any,
      {
        filename: "test.vue",
      },
    );

    assertMessages(messages, [
      {
        ruleId: "vue-scoped-css/no-unused-selector",
        column: 44,
        endColumn: 46,
        endLine: 1,
        line: 1,
      },
      {
        ruleId: "vue-scoped-css/require-selector-used-inside",
        column: 44,
        endColumn: 46,
        endLine: 1,
        line: 1,
      },
    ]);
  });
});
