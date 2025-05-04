import { Client, NetworkEvent } from "stageplay/network"


const client = new Client.PoorSocket<number>()
client.connect({ url: "http://localhost:8080/ws" })
client.on(NetworkEvent.CONNECT, () => {
    client.send(0)
})
client.on(NetworkEvent.MESSAGE, ({ message: count }) => {
    console.log(`Pong (${count})`)
    setTimeout(() => {
        client.send(count + 1)
    })
})