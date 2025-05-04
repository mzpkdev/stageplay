import { Snapshot } from "stageplay/sync"
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
    if (!init && stageBrowser.backstage.size > 0) {
        let i = 0
        for (const _ of stageBrowser.backstage) {
            if (_.type === "Goblin") {
                const hero: HTMLElement = document.createElement("div")
                hero.style.width = "25px"
                hero.style.height = "25px"
                hero.style.background = i === 0 ? "red" : "black"
                hero.style.position = "absolute"
                hero.style.top = "0"
                hero.style.left = "0"
                if (i > 0) {
                    hero.style.transition = "top 0.4s cubic-bezier(0.4, 0, 0.2, 1), left 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                }
                document.body.appendChild(hero)
                sprites.push(hero)
                i++
            }
        }
        for (const actor of stageBrowser.backstage) {
            if (actor.type === "Goblin") {
                if (player === null) {
                    player = actor as Goblin
                } else {
                    break
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
    }
})

client.connect({ url: "http://localhost:8080/ws" })