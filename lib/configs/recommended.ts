import { collectRules } from "../utils/rules";
import path from "path";
const base = require.resolve("./base");
const baseExtend =
  path.extname(`${base}`) === ".ts" ? "plugin:vue-scoped-css/base" : base;
export = {
  extends: baseExtend,
  rules: collectRules("vue2-recommended"),
};
