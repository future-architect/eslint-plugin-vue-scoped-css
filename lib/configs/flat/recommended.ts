import { collectRules } from "../../utils/rules";
import base from "./base";

export default [
  ...base,
  {
    rules: collectRules("vue3-recommended"),
  },
];
