import { Relay } from "stageplay/network"
import { stageServer, Goblin } from "./game"


const relay = new Relay.PoorSocket<number>()
relay.start({ port: 8080, path: "/ws" })
stageServer.networkingVia(relay)

const horde: Goblin[] = new Array(3)
for (let i = 0; i < horde.length; i++) {
    const goblin = Goblin.create<Goblin>()
    stageServer.backstage.add(goblin)
    stageServer.backstage.add(goblin.velocity)
    stageServer.backstage.add(goblin.position)
    stageServer.backstage.add(goblin.owned)
    horde[i] = goblin
}

const simulate = () => {
    for (let i = 0; i < horde.length; i++) {
        const threshold = 0.9
        const goblin = horde[i]
        if (goblin.owned.owned) {
            continue
        }

        if (Math.random() > threshold) {
            goblin.position.x = Math.round(Math.random() * 100) / 100
            // goblin.velocity.x = Math.round((Math.random() - 0.5) * 2)
        }
        if (Math.random() > threshold) {
            goblin.position.y = Math.round(Math.random() * 100) / 100
            // goblin.velocity.y = Math.round((Math.random() - 0.5) * 2)
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