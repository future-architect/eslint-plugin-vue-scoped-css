import postcss from "postcss"

declare module "postcss-scss" {
    const parse: postcss.Parser
    const stringify: postcss.Stringifier
}
