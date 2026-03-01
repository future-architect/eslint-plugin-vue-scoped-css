import { rules as ruleList } from "./utils/rules";
import type { Rule } from "./types";

const rules = ruleList.reduce(
  (obj, r) => {
    obj[r.meta.docs?.ruleName || ""] = r;
    return obj;
  },
  {} as { [key: string]: Rule },
);

export default { rules };
