import { toRegExp } from "./utils/regexp"

export interface QueryOptions {
    ignoreBEMModifier?: boolean
    captureClassesFromDoc?: string[]
}

export interface ParsedQueryOptions {
    ignoreBEMModifier: boolean
    captureClassesFromDoc: RegExp[]
}

/**
 * Parse options
 */
export function parseQueryOptions(
    options: QueryOptions | undefined,
): ParsedQueryOptions {
    const { ignoreBEMModifier, captureClassesFromDoc } = options || {}

    return {
        ignoreBEMModifier: ignoreBEMModifier ?? false,
        captureClassesFromDoc:
            captureClassesFromDoc?.map((s) => toRegExp(s, "g")) ?? [],
    }
}
