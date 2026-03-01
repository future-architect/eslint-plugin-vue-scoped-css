import type { RuleContext, SourceCode } from "../types";

export function getSourceCode(context: RuleContext): SourceCode {
  return context.sourceCode;
}

export function getFilename(context: RuleContext): string {
  return context.filename;
}

export function getPhysicalFilename(context: RuleContext): string {
  return context.physicalFilename;
}

export function getCwd(context: RuleContext): string {
  return context.cwd;
}
