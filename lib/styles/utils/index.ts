/**
 * Checks whether the given lang is supported
 * @param lang
 */
export function isSupportedStyleLang(
  lang: string
): lang is "css" | "scss" | "stylus" {
  return lang === "css" || lang === "scss" || lang === "stylus";
}

/**
 * Escape RegExp to given value
 * @param {string} value The base value
 * @returns {string} The escape string
 */
export function escapeRegExp(value: string): string {
  // eslint-disable-next-line regexp/no-obscure-range -- ignore
  return value.replace(/[$(-+.?[-^{-}]/gu, "\\$&"); // $& means the whole matched string
}
