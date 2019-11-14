import { collectRules } from "../utils/rules"

export = {
    extends: require.resolve("./base"),
    rules: collectRules(),
}
