import type { Throwable } from './types'

export const old_shoe: Throwable = {
    type: 'throwable',
    name: 'old shoe',
    description: 'An old shoe',
    damage: 1,
    bounce_chance: 0.1
}

export const beach_ball: Throwable = {
    type: 'throwable',
    name: 'beach ball',
    description: 'A beach ball',
    damage: 0.5,
    bounce_chance: 0.5
}

export const throwables: { [key: string]: Throwable } = {
    old_shoe,
    beach_ball
}