import { Throwable, ThrowableNames } from './types'

export const old_shoe: Throwable = {
    type: 'throwable',
    name: ThrowableNames.old_shoe,
    description: 'An old shoe',
    damage: 4,
    bounce_chance: 0.1
}

export const beach_ball: Throwable = {
    type: 'throwable',
    name: ThrowableNames.beach_ball,
    description: 'A beach ball',
    damage: 2,
    bounce_chance: 0.5
}

export const throwables: { [key in ThrowableNames]: Throwable } = {
    [ThrowableNames.old_shoe]: old_shoe,
    [ThrowableNames.beach_ball]: beach_ball
}