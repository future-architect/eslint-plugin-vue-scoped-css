import { rules as ruleList } from "./utils/rules";
import type { Rule } from "./types";
import flatBase from "./configs/flat/base";
import flatRecommended from "./configs/flat/recommended";
import flatVue2Recommended from "./configs/flat/vue2-recommended";
import flatAll from "./configs/flat/all";

const configs = {
  base: flatBase,
  recommended: flatRecommended,
  "vue2-recommended": flatVue2Recommended,
  all: flatAll,
  /** @deprecated Use `base` instead. */
  "flat/base": flatBase,
  /** @deprecated Use `recommended` instead. */
  "flat/recommended": flatRecommended,
  /** @deprecated Use `vue2-recommended` instead. */
  "flat/vue2-recommended": flatVue2Recommended,
  /** @deprecated Use `all` instead. */
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
