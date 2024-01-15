import { getLinter } from "eslint-compat-utils/linter";

import fs from "fs";
import path from "path";

import type { RuleContext } from "../../../lib/types";
import type { StyleContext } from "../../../lib/styles/context";
import { getStyleContexts } from "../../../lib/styles/context";
import * as vueParser from "vue-eslint-parser";

// eslint-disable-next-line @typescript-eslint/naming-convention -- Class name
const Linter = getLinter();
const ROOT = path.join(__dirname, "./fixtures/index");

const config = {
  files: ["*", "*.vue", "**/*.vue"],
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
  linter.verifyAndFix(
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
  if (!style || !context) {
    throw new Error("invalid state");
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
