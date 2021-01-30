import type * as postcss from "postcss"

declare module "postcss-styl" {
    const parse: postcss.Parser, stringify: postcss.Stringifier
}
