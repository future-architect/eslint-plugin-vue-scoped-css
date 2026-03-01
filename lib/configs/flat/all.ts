import { collectRules } from "../../utils/rules.ts";
import base from "./base.ts";

export default [
  ...base,
  {
    rules: collectRules(),
    name: "vue-scoped-css/all",
  },
];
