import { Snapshot } from "../../netcode"
import { Client, NetworkEvent as Event } from "stageplay/network"
import { Goblin, stageBrowser } from "./game"


const client = new Client.PoorSocket<Snapshot>()
client.on(Event.MESSAGE, ({ message: snapshot }) => {
    const { timestamp, state } = snapshot
    const log = () => {
        console.log(`timestamp: ${timestamp}`, Array.from(state))
    }
    // log()
})
let init = false
const sprites: HTMLElement[] = []
let player = null as unknown as Goblin | null
client.on(Event.MESSAGE, () => {
    if (player) {
        player.owned.owned = true
    }
    if (!init && stageBrowser.backstage.size > 0) {
        let i = 0
        for (const _ of stageBrowser.backstage) {
            if (_.type === "Goblin") {
                const goblin = _ as Goblin
                const hero: HTMLElement = document.createElement("div")
                hero.style.width = "25px"
                hero.style.height = "25px"
                hero.style.color = "white"
                hero.style.background = "black"
                hero.style.cursor = "none"
                hero.innerText = _.id.slice(0, 5)
                hero.style.position = "absolute"
                hero.style.top = "0"
                hero.style.left = "0"
                hero.style.transition = "top 0.4s cubic-bezier(0.4, 0, 0.2, 1), left 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                document.body.appendChild(hero)
                sprites.push(hero)
                i++
            }
        }
        for (const actor of stageBrowser.backstage) {
            if (actor.type === "Goblin") {
                const goblin = actor as Goblin
                console.warn(player, goblin)
                if (player === null && !goblin.owned.owned) {
                    player = goblin
                }
            }
        }
        init = true
    }
})


stageBrowser.networkingVia(client)


// const loop = () => {
//     // console.log(Array.from(stageBrowser.actors))
//     setTimeout(loop, 1000)
// }
// setTimeout(loop)

let last2 = performance.now()
const loop2 = (now: number) => {
    const dt = (now - last2) / 1000
    last2 = now
    stageBrowser.update(dt)
    if (sprites.length) {
        let i = 0
        for (const actor of stageBrowser.backstage) {
            if (actor.type === "Goblin") {
                const sprite = sprites[i]
                const goblin = actor as Goblin
                // console.log(actor.type, goblin.position)
                sprite.style.left = `${goblin.position.x * window.innerWidth}px`
                sprite.style.top = `${goblin.position.y * window.innerHeight}px`
                if (goblin.owned.owned) {
                    sprite.style.background = "blue"
                    sprite.style.transition = ""
                }
                if (goblin.owned.owned && goblin === player) {
                    sprite.style.background = "red"
                    sprite.style.transition = ""
                }
                i++
            }
        }
    }
    setTimeout(loop2, 16)
}
setTimeout(loop2)

document.addEventListener("mousemove", function (event) {
    const xNorm = event.clientX / window.innerWidth
    const yNorm = event.clientY / window.innerHeight
    if (player) {
        player.position.x = xNorm
        player.position.y = yNorm
        player.owned.owned = true
    }
})

client.connect({ url: `http://${location.hostname}:8080/ws` })