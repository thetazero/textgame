import { Trinket } from './types'

export const ring: Trinket = {
    type: 'trinket',
    name: 'Ring',
    description: 'A simple ring',
    add_modifiers: {
        luck: 1
    },
    mul_modifiers: {}
}

export const trinkets: Trinket[] = [ring]