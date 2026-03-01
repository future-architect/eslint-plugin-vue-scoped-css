/**
 * Tests for optional peer dependency behavior.
 *
 * These tests verify that:
 * 1. The parsers load without throwing when their optional peer deps are missing.
 * 2. A descriptive error message is returned when parsing is attempted
 *    without the required optional peer dep.
 *
 * How mocking works:
 *   - `loadOptionalDep` in `load-optional-dep.ts` uses `createRequire` (CJS) internally.
 *   - Importing the parser modules does NOT trigger the CJS load of the optional deps
 *     because the `loadOptionalDep` call was moved to the parser constructor.
 *   - Therefore, the optional deps are NOT in the CJS module cache when the test runs.
 *   - Patching `Module._load` before constructing a parser instance causes
 *     `loadOptionalDep` to receive a MODULE_NOT_FOUND error and return `null`.
 *   - The instance's private field is `null`, so `parseInternal` throws the expected error.
 */
import assert from "node:assert";
import Module from "node:module";

import { CSSParser } from "../../../../lib/styles/parser/css-parser.ts";
import { SCSSParser } from "../../../../lib/styles/parser/scss-parser.ts";
import { StylusParser } from "../../../../lib/styles/parser/stylus-parser.ts";
import type { VCSSStyleSheet } from "../../../../lib/styles/ast.ts";
import type { SourceCode } from "../../../../lib/types.ts";

/** Minimal SourceCode mock sufficient for the error-path in CSSParser.parse */
const mockSourceCode = {
  getIndexFromLoc: (_loc: Parameters<SourceCode["getIndexFromLoc"]>[0]) => 0,
  getLocFromIndex: (
    _idx: Parameters<SourceCode["getLocFromIndex"]>[0],
  ) => ({ line: 1, column: 0 }),
} as unknown as SourceCode;

function makeModuleNotFoundError(depName: string): NodeJS.ErrnoException {
  const err: NodeJS.ErrnoException = new Error(
    `Cannot find module '${depName}'`,
  );
  err.code = "MODULE_NOT_FOUND";
  return err;
}

/**
 * Creates a parser instance while simulating the named dependency being absent.
 * The `Module._load` mock is active only during construction; after that it is
 * restored so normal parsing (used by other tests) is not affected.
 */
function createParserWithMissingDep(
  ParserClass: new (sourceCode: SourceCode, lang: string) => CSSParser,
  lang: string,
  missingDep: string,
): CSSParser {
  const orig = (Module as any)._load; // `_load` is a Node.js internal not in @types/node
  (Module as any)._load = function (
    request: string,
    parent: unknown,
    isMain: boolean,
  ) {
    if (request === missingDep) {
      throw makeModuleNotFoundError(missingDep);
    }
    return orig.call(this, request, parent, isMain);
  };
  try {
    return new ParserClass(mockSourceCode, lang);
  } finally {
    (Module as any)._load = orig;
  }
}

describe("Optional peer dependency – postcss-scss", () => {
  it("SCSSParser loads without throwing when postcss-scss is not installed", () => {
    // If construction threw, this line would not be reached.
    const parser = createParserWithMissingDep(SCSSParser, "scss", "postcss-scss");
    assert.ok(parser instanceof SCSSParser);
  });

  it("returns a descriptive error when parsing SCSS without postcss-scss", () => {
    const parser = createParserWithMissingDep(SCSSParser, "scss", "postcss-scss");
    const result: VCSSStyleSheet = parser.parse(".foo {}", { line: 1, column: 0 });

    assert.ok(
      result.errors.length > 0,
      "Expected at least one parse error when postcss-scss is missing",
    );
    const message = result.errors[0].message;
    assert.ok(
      message.includes("postcss-scss"),
      `Error message should mention 'postcss-scss', got: ${message}`,
    );
    assert.ok(
      message.includes("npm install"),
      `Error message should include install instructions, got: ${message}`,
    );
  });
});

describe("Optional peer dependency – postcss-styl", () => {
  it("StylusParser loads without throwing when postcss-styl is not installed", () => {
    const parser = createParserWithMissingDep(
      StylusParser,
      "stylus",
      "postcss-styl",
    );
    assert.ok(parser instanceof StylusParser);
  });

  it("returns a descriptive error when parsing Stylus without postcss-styl", () => {
    const parser = createParserWithMissingDep(
      StylusParser,
      "stylus",
      "postcss-styl",
    );
    const result: VCSSStyleSheet = parser.parse(".foo {}", { line: 1, column: 0 });

    assert.ok(
      result.errors.length > 0,
      "Expected at least one parse error when postcss-styl is missing",
    );
    const message = result.errors[0].message;
    assert.ok(
      message.includes("postcss-styl"),
      `Error message should mention 'postcss-styl', got: ${message}`,
    );
    assert.ok(
      message.includes("npm install"),
      `Error message should include install instructions, got: ${message}`,
    );
  });
});
