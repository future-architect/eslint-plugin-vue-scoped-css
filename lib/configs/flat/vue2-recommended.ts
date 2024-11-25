import { collectRules } from "../../utils/rules";
import base from "./base";

export default [
  ...base,
  {
    rules: collectRules("vue2-recommended"),
    name: "vue-scoped-css/flat/vue2-recommended",
  },
];
