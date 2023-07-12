import { rules as ruleList } from "./utils/rules";
import type { Rule } from "./types";

const configs = {
  base: require("./configs/base"),
  recommended: require("./configs/recommended"),
  "vue3-recommended": require("./configs/vue3-recommended"),
  all: require("./configs/all"),
};

const rules = ruleList.reduce(
  (obj, r) => {
    obj[r.meta.docs?.ruleName || ""] = r;
    return obj;
  },
  {} as { [key: string]: Rule },
);

export = {
  configs,
  rules,
};
