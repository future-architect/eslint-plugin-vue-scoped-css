import { rules as ruleList } from "./utils/rules";
import type { Rule } from "./types";
import flatBase from "./configs/flat/base";
import flatRecommended from "./configs/flat/recommended";
import flatVue2Recommended from "./configs/flat/vue2-recommended";
import flatAll from "./configs/flat/all";

const configs = {
  base: require("./configs/base"),
  recommended: require("./configs/recommended"),
  "vue3-recommended": require("./configs/vue3-recommended"),
  all: require("./configs/all"),
  "flat/base": flatBase,
  "flat/recommended": flatRecommended,
  "flat/vue2-recommended": flatVue2Recommended,
  "flat/all": flatAll,
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
