import { toRegExp } from "./utils/regexp"

export interface QueryOptions {
    ignoreBEMModifier?: boolean
    captureClassesFromDoc?: string[]
}

export interface ParsedQueryOptions {
    ignoreBEMModifier: boolean
    captureClassesFromDoc: RegExp[]
}

export namespace ParsedQueryOptions {
    /**
     * Parse options
     */
    export function parse(
        options: QueryOptions | undefined,
    ): ParsedQueryOptions {
        const { ignoreBEMModifier, captureClassesFromDoc } = options || {}

        return {
            ignoreBEMModifier: ignoreBEMModifier ?? false,
            captureClassesFromDoc:
                captureClassesFromDoc?.map((s) => toRegExp(s, "g")) ?? [],
        }
    }
}
