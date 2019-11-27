import postcss from "postcss"

declare module "postcss-styl" {
    const parse: postcss.Parser
    const stringify: postcss.Stringifier
}
