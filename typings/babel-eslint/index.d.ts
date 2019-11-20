import { Linter } from "eslint"

declare module "babel-eslint" {
    function parseForESLint(
        text: string,
        options?: any,
    ): Linter.ESLintParseResult
}
