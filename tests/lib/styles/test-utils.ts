import { Linter } from "eslint";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { RuleContext } from "../../../lib/types.ts";
import type { StyleContext } from "../../../lib/styles/context/index.ts";
import { getStyleContexts } from "../../../lib/styles/context/index.ts";
import * as vueParser from "vue-eslint-parser";

const ROOT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "./fixtures/index",
);

const config = {
  files: ["*", "*.vue", "**/*.vue", "**"],
  languageOptions: {
    parser: vueParser,
    ecmaVersion: 2019,
    sourceType: "module",
  },
  rules: {
    "test/test": "error",
  },
};

/**
 * Execute eslint
 * @param {string} source the source code
 */
function executeLint(
  source: string,
  sourcePath: string,
  _name: string,
): { style: StyleContext; context: RuleContext } {
  const linter = new Linter();
  let style: StyleContext | null = null;
  let context: RuleContext | null = null;
  let err = null;
  const lintResult = linter.verifyAndFix(
    source,
    {
      ...config,
      plugins: {
        test: {
          rules: {
            test: {
              create(ctx: RuleContext) {
                try {
                  context = ctx;
                  style = getStyleContexts(ctx)[0];
                } catch (e) {
                  err = e;
                }
                return {};
              },
            },
          },
        },
      },
    } as any,
    sourcePath,
  );
  if (err) {
    throw err;
  }
  if (lintResult.messages.length) {
    lintResult.messages.forEach((message: Linter.LintMessage) => {
      console.error(
        `[${message.ruleId}] ${message.message} (${message.line}:${message.column})`,
      );
    });
    throw new Error(`Linting errors found in ${sourcePath}`);
  }
  if (!style) {
    throw new Error("invalid state: style is null");
  }
  if (!context) {
    throw new Error("invalid state: context is null");
  }
  return { style, context };
}

export function* getStyleFixtureResults(rootDir = ROOT): IterableIterator<{
  name: string;
  style: StyleContext;
  source: string;
  context: RuleContext;
  dir: string;
}> {
  for (const name of fs.readdirSync(rootDir)) {
    if (name === ".DS_Store") {
      continue;
    }
    const sourcePath = path.join(rootDir, `${name}/source.vue`);
    const source = fs.readFileSync(sourcePath, "utf8");

    const { style, context } = executeLint(source, sourcePath, name);
    yield {
      name,
      style,
      source,
      context,
      dir: path.join(rootDir, `${name}`),
    };
  }
}

export function writeFixture(expectFilepath: string, content: string): void {
  // eslint-disable-next-line no-process-env -- test
  if (process.env.UPDATE_FIXTURE) {
    fs.writeFileSync(expectFilepath, content, "utf8");
  }
}
export function deleteFixture(filepath: string): void {
  // eslint-disable-next-line no-process-env -- test
  if (process.env.UPDATE_FIXTURE) {
    fs.unlinkSync(filepath);
  }
}
export function isExistsPath(filepath: string): boolean {
  try {
    fs.statSync(filepath);
    return true;
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}
