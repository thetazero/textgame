export const reset = '\x1b[0m'
export const bold = '\x1b[1m'
export const italic = '\x1b[3m'
export const underline = '\x1b[4m'
export const green = '\x1b[32m'
export const blue = '\x1b[34m'

export const make_bold = make_gen(bold)

function make_gen(markup: string) {
    return (text: string) => `${markup}${text}${reset}`
}