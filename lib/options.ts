import { toRegExp } from "./utils/regexp";

export interface QueryOptions {
  ignoreBEMModifier?: boolean;
  captureClassesFromDoc?: string[];
  customClassAttributes?: string[];
}

export interface ParsedQueryOptions {
  ignoreBEMModifier: boolean;
  captureClassesFromDoc: RegExp[];
  customClassAttributes: string[];
}

/**
 * Parse options
 */
export function parseQueryOptions(
  options: QueryOptions | undefined,
): ParsedQueryOptions {
  const { ignoreBEMModifier, captureClassesFromDoc, customClassAttributes } =
    options || {};

  return {
    ignoreBEMModifier: ignoreBEMModifier ?? false,
    captureClassesFromDoc:
      captureClassesFromDoc?.map((s) => toRegExp(s, "g")) ?? [],
    customClassAttributes: customClassAttributes ?? [],
  };
}
