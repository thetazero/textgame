export type Trinket = {
    type: 'trinket'
    name: string
    description: string
    add_modifiers: { [id: string]: number }
    mul_modifiers: { [id: string]: number }
}

export enum ThrowableNames {
    old_shoe = 'Old Shoe',
    beach_ball = 'Beach Ball',
}

export type Throwable = {
    type: 'throwable'
    name: ThrowableNames
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
    loot_table: LootEntry[]
}

export type LootEntry = {
    trinket: Trinket
    weight: number
}