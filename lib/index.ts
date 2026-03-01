import { rules as ruleList } from "./utils/rules.ts";
import type { Rule } from "./types.ts";
import flatBase from "./configs/flat/base.ts";
import flatRecommended from "./configs/flat/recommended.ts";
import flatVue2Recommended from "./configs/flat/vue2-recommended.ts";
import flatAll from "./configs/flat/all.ts";

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

export default {
  configs,
  rules,
};
