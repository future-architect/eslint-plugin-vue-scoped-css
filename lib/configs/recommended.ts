import { collectRules } from "../utils/rules";

export = {
  extends: require.resolve("./base"),
  rules: collectRules("vue2-recommended"),
};
