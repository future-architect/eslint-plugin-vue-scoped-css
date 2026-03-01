import { collectRules } from "../../utils/rules.ts";
import base from "./base.ts";

export default [
  ...base,
  {
    rules: collectRules("vue3-recommended"),
    name: "vue-scoped-css/recommended",
  },
];
