export type Trinket = {
    type: 'trinket'
    name: string
    description: string
    add_modifiers: { [id: string]: number }
    mul_modifiers: { [id: string]: number }
}

export type Throwable = {
    type: 'throwable'
    name: string
    description: string
    damage: number
    bounce_chance: number
}

export type Monster = {
    type: 'monster'
    name: string
    description: string
    health: number
    attack: number
    defense: number
    loot_table: LootEntry[]
}

export type LootEntry = {
    trinket: Trinket
    weight: number
}