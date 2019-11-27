import { Interpolation } from "../interpolation"

/**
 * Returns the template elements that the given text.
 */
export function processText(text: string): (Interpolation | string)[] {
    const elements = []
    const value = text
    let start = 0
    const reg = /\{(?:[\s\S]*?)\}/gu
    let re = null
    while ((re = reg.exec(value))) {
        elements.push(value.slice(start, re.index))
        elements.push(new Interpolation(value.slice(re.index, reg.lastIndex)))
        start = reg.lastIndex
    }
    elements.push(value.slice(start))

    return elements
}

/**
 * Returns the template elements that the given value.
 */
export function processValue(text: string): (Interpolation | string)[] {
    if (text.includes("+") || text.includes("$")) {
        return [new Interpolation(text)]
    }
    return [text]
}
