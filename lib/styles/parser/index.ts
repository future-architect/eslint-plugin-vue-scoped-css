import { CSSParser } from "./css-parser"
import { SCSSParser } from "./scss-parser"
import { StylusParser } from "./stylus-parser"
import type { SourceCode, LineAndColumnData } from "../../types"
import type { VCSSStyleSheet } from "../ast"
import { isSupportedStyleLang } from "../utils"

const PARSERS = {
    scss: SCSSParser,
    css: CSSParser,
    stylus: StylusParser,
}

/**
 * Parse the CSS.
 * @param {SourceCode} sourceCode the SourceCode object that you can use to work with the source that was passed to ESLint.
 * @param {LineAndColumnData} offsetLocation start location of css.
 * @param {string} css the CSS to parse
 * @param {string} lang the language of `<style>`
 * @return {VCSSStyleSheet} parsed result
 */
export function parse(
    sourceCode: SourceCode,
    offsetLocation: LineAndColumnData,
    css: string,
    lang: string,
): VCSSStyleSheet {
    const Parser = isSupportedStyleLang(lang) ? PARSERS[lang] : CSSParser
    const parser = new Parser(sourceCode, lang)
    return parser.parse(css, offsetLocation)
}
