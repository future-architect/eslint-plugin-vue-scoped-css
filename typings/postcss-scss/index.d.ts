import type * as postcss from "postcss";

declare module "postcss-scss" {
  const parse: postcss.Parser, stringify: postcss.Stringifier;
}
