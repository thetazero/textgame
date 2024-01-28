import type { Monster } from './types'
import * as trinkets from './trinkets'
import * as markup from './markup'

export const goblin: Monster = {
    type: 'monster',
    name: 'Goblin',
    description: 'A small goblin',
    health: 10,
    attack: 1,
    loot_table: [
        {
            trinket: trinkets.ring,
            weight: 1
        }
    ]
}

export function monster_to_string(monster: Monster): string {
    return `${markup.make_bold(monster.name)}<health: ${monster.health}, attack: ${monster.attack}>`
}