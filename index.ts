import * as readline from 'readline'
import * as markup from './markup'
import type { Trinket, Throwable, Monster } from './types'
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
    scene: Scenes,
    first_time: boolean,
    monster: Monster | null
    trinkets: Trinket[]
    throwables: Throwable[]
}

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

function game_state_to_string(state: GameState): string {
    switch (state.scene) {
        case Scenes.Main:
            if (state.first_time) {
                state.first_time = false
                return `Welcome to ${markup.bold}throw cabinet garage${markup.reset}!
Open the cabinet of curiosities to get a surprise.
Go to the garage to improve your gear.`
            } else {
                return 'You are in limbo'
            }
        case Scenes.Cabinet:
            return `You are looking at a ${'???'} cabinet`
        case Scenes.Garage:
            return 'You are looking at a garage'
        case Scenes.Fight:
            return `An evil ${markup.make_bold(state.monster!.name)} is attacking you!`
    }
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

function throwable_to_action(throwable: Throwable): Action {
    return {
        name: `throw ${throwable.name}:${throwable.damage}`,
        execute: (state: GameState) => {
            let keep: boolean = Math.random() < throwable.bounce_chance
            let damage: number = throwable.damage
            console.log(`You threw a ${markup.make_bold(throwable.name)} for ${markup.make_bold(damage.toString())}!`)
            if (keep) {
                console.log(`The ${markup.make_bold(throwable.name)} bounced back!`)
            } else {
                for (let i = 0; i < state.throwables.length; i++) {
                    if (state.throwables[i] === throwable) {
                        state.throwables.splice(i, 1)
                        break
                    }
                }
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
                                state.throwables.push(thing)
                                break
                        }
                    }
                },
                goto_main,
                ...default_actions
            ]
        case Scenes.Garage:
            return [...default_actions]
        case Scenes.Fight:
            const throw_actions = state.throwables.map(throwable_to_action)
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
        throwables: [],
        trinkets: [],
    }

    while (true) {
        let game_state_string: string = game_state_to_string(state)
        console.log(`${markup.bold}<${state.scene.toString().toLowerCase()}>${markup.reset} ${game_state_string}`)
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