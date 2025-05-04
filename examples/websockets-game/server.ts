import { Relay } from "stageplay/network"
import { stageServer, Goblin } from "./game"


const relay = new Relay.PoorSocket<number>()
relay.start({ port: 8080, path: "/ws" })
stageServer.networkingVia(relay)

const horde: Goblin[] = new Array(5)
for (let i = 0; i < horde.length; i++) {
    const goblin = Goblin.create<Goblin>()
    stageServer.backstage.add(goblin)
    horde[i] = goblin
}
const simulate = () => {
    for (let i = 0; i < horde.length; i++) {
        if (i === 0) {
            continue
        }
        const threshold = 0.9
        const goblin = horde[i]
        // if (goblin===undefined) {
        //     console.log("ERROR:GOBLIN:", goblin)
        // }
        if (goblin.position===undefined) {
            const { id, type, origin} = goblin
            console.log({ id, type, origin }, goblin)
            console.log("ERROR:GOBLIN.POSITION:", goblin.position)
        }
        if (Math.random() > threshold) {
            goblin.position.x = Math.random()
            goblin.velocity.x = Math.round((Math.random() - 0.5) * 2)
        }
        if (Math.random() > threshold) {
            goblin.position.y = Math.random()
            goblin.velocity.y = Math.round((Math.random() - 0.5) * 2)
        }
        // if (Math.random() > 0.99) {
        //     goblin.foobar = { hello: !goblin.foobar?.hello }
        // }
        // if (Math.random() > 0.999) {
        //     stageServer.actors.delete(goblin)
        // }
    }
}


let last = performance.now()
const loop = (now: number) => {
    const dt = (now - last) / 1000
    last = now
    simulate()
    stageServer.update(dt)
    setTimeout(loop)
}
setTimeout(loop)