import type { Monster } from './types'
import * as trinkets from './trinkets'

export const goblin: Monster = {
    type: 'monster',
    name: 'Goblin',
    description: 'A small goblin',
    health: 10,
    attack: 5,
    defense: 5,
    loot_table: [
        {
            trinket: trinkets.ring,
            weight: 1
        }
    ]
}