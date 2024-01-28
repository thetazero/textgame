export function an_something(something: string) {
    if (something[0].match(/[aeiou]/)) {
        return `an ${something}`
    } else {
        return `a ${something}`
    }
}