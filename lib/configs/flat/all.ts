import { collectRules } from "../../utils/rules";
import base from "./base";

export default [
  ...base,
  {
    rules: collectRules(),
    name: "vue-scoped-css/flat/all",
  },
];
