import { Relay, NetworkEvent } from "stageplay/network"


const relay = new Relay.PoorSocket<number>()
relay.start({ port: 8080, path: "/ws" })

relay.on(NetworkEvent.MESSAGE, ({ message: count, session }) => {
    // console.log(`Ping (${count})`)
    setTimeout(() => {
        relay.send(count + 1, session)
    }, 1000)
})
