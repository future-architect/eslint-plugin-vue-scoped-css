import {
  getRuleTester,
  getRuleIdPrefix,
} from "eslint-compat-utils/rule-tester";
import { getLegacyESLint } from "eslint-compat-utils/eslint";

// eslint-disable-next-line @typescript-eslint/naming-convention -- Class name
export const RuleTester = getRuleTester();
export const testRuleIdPrefix = getRuleIdPrefix();

// eslint-disable-next-line @typescript-eslint/naming-convention -- Class name
export const LegacyESLint = getLegacyESLint();
