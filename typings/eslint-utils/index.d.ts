import { ASTNode, AST } from "../../lib/types"
// eslint-disable-next-line @mysticatea/node/no-extraneous-import
import { Scope } from "eslint-scope"

declare const utils: {
    getStaticValue: (
        node: AST.ESLintExpression,
        scope: Scope,
    ) => null | { value: any }
}
export default utils
