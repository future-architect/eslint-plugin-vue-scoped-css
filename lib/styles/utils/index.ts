/**
 * Checks whether the given lang is supported
 * @param lang
 */
export function isSupportedStyleLang(
    lang: string,
): lang is "css" | "scss" | "stylus" {
    return lang === "css" || lang === "scss" || lang === "stylus"
}

/**
 * Checks whether the given node has defined
 */
export function isDefined<T>(item: T | null | undefined): item is T {
    return item !== null && item !== undefined
}

/**
 * Escape RegExp to given value
 * @param {string} value The base value
 * @returns {string} The escape string
 */
export function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&") // $& means the whole matched string
}
