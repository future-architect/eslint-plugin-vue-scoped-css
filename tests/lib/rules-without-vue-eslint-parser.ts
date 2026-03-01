import { Linter } from "eslint";
import plugin from "../../lib/index";

describe("Don't crash even if without vue-eslint-parser.", () => {
  const code = "<style scoped>.a {}</style>";

  for (const key of Object.keys(plugin.rules)) {
    const ruleId = `vue-scoped-css/${key}`;

    it(ruleId, () => {
      const linter = new Linter();
      const config = {
        languageOptions: {
          ecmaVersion: 2015,
          parserOptions: {
            ecmaFeatures: {
              jsx: true,
            },
          },
        },
        plugins: { "vue-scoped-css": plugin },
        rules: {
          [ruleId]: "error",
        },
      };
      linter.verifyAndFix(code, config as any, "test.vue");
    });
  }
});
