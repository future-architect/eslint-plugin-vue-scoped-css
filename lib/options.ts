import { toRegExp } from "./utils/regexp";

export interface QueryOptions {
  ignoreBEMModifier?: boolean;
  captureClassesFromDoc?: string[];
  extraClassAttributes?: string[];
}

export interface ParsedQueryOptions {
  ignoreBEMModifier: boolean;
  captureClassesFromDoc: RegExp[];
  extraClassAttributes: string[];
}

/**
 * Parse options
 */
export function parseQueryOptions(
  options: QueryOptions | undefined,
): ParsedQueryOptions {
  const { ignoreBEMModifier, captureClassesFromDoc, extraClassAttributes } =
    options || {};

  return {
    ignoreBEMModifier: ignoreBEMModifier ?? false,
    captureClassesFromDoc:
      captureClassesFromDoc?.map((s) => toRegExp(s, "g")) ?? [],
    extraClassAttributes: extraClassAttributes ?? [],
  };
}
