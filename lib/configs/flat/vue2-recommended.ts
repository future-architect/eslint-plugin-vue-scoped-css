import { collectRules } from "../../utils/rules.ts";
import base from "./base.ts";

export default [
  ...base,
  {
    rules: collectRules("vue2-recommended"),
    name: "vue-scoped-css/vue2-recommended",
  },
];
