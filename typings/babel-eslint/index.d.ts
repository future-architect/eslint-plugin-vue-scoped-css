import type { Linter } from "eslint"

declare module "babel-eslint" {
    function parseForESLint(
        text: string,
        options?: unknown,
    ): Linter.ESLintParseResult
}
