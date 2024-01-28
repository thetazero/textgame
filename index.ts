import * as readline from 'readline'
import * as markup from './markup'
import type { Trinket, Throwable, Monster, ThrowableNames } from './types'
import * as trinkets from './trinkets'
import * as monsters from './monsters'
import * as throwables from './throwables'


enum Scenes {
    Cabinet = 'Cabinet',
    Main = 'Main',
    Garage = 'Garage',
    Fight = 'Fight',
}

type GameState = {
    scene: Scenes
    first_time: boolean
    monster: Monster | null
    trinkets: Trinket[]
    throwables: {
        [key in ThrowableNames]?: number
    }
    health: number
}

const max_health = 10

type Action = {
    name: string
    execute: (state: GameState) => void
}

function random_element<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)]
}

function cabinet_thing(level: number): Trinket | Monster | Throwable {
    if (Math.random() < 0.3) {
        return random_element(trinkets.trinkets)
    } else if (Math.random() < 0.8) {
        return random_element(Array.from(Object.values(throwables.throwables)))
    }
    else {
        return monsters.goblin
    }
}

const GameStateToString: { [key in Scenes]: (state: GameState) => string } = {
    [Scenes.Main]: (state: GameState) => {
        return ''
    },
    [Scenes.Cabinet]: (state: GameState) => {
        return 'You are looking at a cabinet of curiosities'
    },
    [Scenes.Garage]: (state: GameState) => {
        return 'You are at your garage'
    },
    [Scenes.Fight]: (state: GameState) => {
        return `An evil ${monsters.monster_to_string(state.monster!)} is attacking you!`
    },
}

const GameStateRunner: { [key in Scenes]: (state: GameState) => void } = {
    [Scenes.Main]: (state: GameState) => {
        if (state.first_time) {
            state.first_time = false
            console.log(`Welcome to ${markup.bold}throw cabinet garage${markup.reset}!
Open the cabinet of curiosities to get a surprise.
Go to the garage to improve your gear.`)
        }
        if (state.health < max_health) {
            state.health = max_health
            console.log('You feel refreshed!')
        }
    },
    [Scenes.Cabinet]: (state: GameState) => { },
    [Scenes.Garage]: (state: GameState) => { },
    [Scenes.Fight]: (state: GameState) => {
        const monster: Monster = state.monster!
        const damage_taken: number = monster.attack
        state.health -= damage_taken
        console.log(`The ${markup.make_bold(monster.name)} attacks you for ${markup.make_bold(damage_taken.toString())} damage!`)
        console.log(`You have ${markup.make_bold(state.health.toString())} health remaining.`)
        if (state.health <= 0) {
            console.log('You died!')
            process.exit(0)
        }
    },
}

function goto_scene_generator(scene: Scenes): Action {
    return {
        name: scene.toString().toLowerCase(),
        execute: (state: GameState) => {
            state.scene = scene
        }
    }
}

const goto_main: Action = goto_scene_generator(Scenes.Main)
const goto_cabinet: Action = goto_scene_generator(Scenes.Cabinet)
const goto_garage: Action = goto_scene_generator(Scenes.Garage)

function throwable_to_action(name: ThrowableNames, throw_items: { [key in ThrowableNames]?: number }): Action {
    const throwable: Throwable = throwables.throwables[name]
    return {
        name: `throw ${name} <${throwable.damage} dmg, ${throw_items[name]} remaining>`,
        execute: (state: GameState) => {
            let keep: boolean = Math.random() < throwable.bounce_chance
            let damage: number = throwable.damage
            console.log(`You threw a ${markup.make_bold(name)} for ${markup.make_bold(damage.toString())} damage!`)
            if (keep) {
                console.log(`The ${markup.make_bold(name)} bounced back!`)
            } else {
                console.log(`You lost the ${markup.make_bold(name)}!`)
                state.throwables[name]! -= 1
                if (state.throwables[name] === 0) {
                    delete state.throwables[name]
                }
            }
            const monster: Monster = state.monster!
            monster.health -= damage
            if (monster.health <= 0) {
                console.log(`You killed the ${markup.make_bold(monster.name)}!`)
                state.monster = null
                state.scene = Scenes.Main
                // TODO: loot
            }
        }
    }
}

function get_actions(state: GameState): Action[] {
    const default_actions = [
        {
            name: 'quit',
            execute: (state: GameState) => {
                process.exit(0)
            }
        }
    ]
    switch (state.scene) {
        case Scenes.Main:
            return [
                goto_cabinet,
                goto_garage,
                ...default_actions
            ]
        case Scenes.Cabinet:
            return [
                {
                    name: 'open cabinet',
                    execute: (state: GameState) => {
                        let thing = cabinet_thing(1)
                        switch (thing.type) {
                            case 'trinket':
                                console.log(`You found a ${markup.make_bold(thing.name)}!`)
                                state.trinkets.push(thing)
                                break
                            case 'monster':
                                console.log('Uh oh!')
                                state.monster = thing
                                state.scene = Scenes.Fight
                                break
                            case 'throwable':
                                console.log(`You found a ${markup.make_bold(thing.name)}!`)
                                if (state.throwables[thing.name]) {
                                    state.throwables[thing.name]! += 1
                                } else {
                                    state.throwables[thing.name] = 1
                                }
                        }
                    }
                },
                goto_main,
                ...default_actions
            ]
        case Scenes.Garage:
            return [...default_actions]
        case Scenes.Fight:
            const throw_actions = (Object.keys(state.throwables) as ThrowableNames[]).map(
                (throwable_name) => throwable_to_action(throwable_name, state.throwables)
            )
            return [
                ...throw_actions,
                ...default_actions
            ]
    }
}

function actions_to_string(actions: Action[]) {
    return actions.map((action, i) => `${markup.bold}(${i})${markup.reset} ${action.name}`).join(' ')
}


async function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    const state: GameState = {
        scene: Scenes.Main,
        first_time: true,
        monster: null,
        throwables: {},
        trinkets: [],
        health: max_health,
    }

    while (true) {
        let game_state_string: string = GameStateToString[state.scene](state)
        console.log(`${markup.bold}<${state.scene.toString().toLowerCase()}>${markup.reset} ${game_state_string}`)
        GameStateRunner[state.scene](state)

        let actions = get_actions(state)
        console.log(actions_to_string(actions))
        const line = await new Promise<string>((resolve) => rl.question('> ', resolve))
        let index: number = parseInt(line)
        if (index < 0 || index >= actions.length) {
            console.log('Invalid action')
        } else {
            let action = actions[index]
            action.execute(state)
        }
    }
}

main()