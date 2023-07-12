import type { AST } from "../../lib/types";
import type { Scope } from "eslint-scope";

declare const utils: {
  getStaticValue: (
    node: AST.ESLintExpression,
    scope: Scope,
  ) => null | {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ignore
    value: any;
  };
};
export default utils;
