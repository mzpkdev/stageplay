import { Client, NetworkEvent, Relay } from "stageplay/network"


const ice = {
    url: "turn:global.relay.metered.ca:80",
    username: "0216de3689c0327b92c21461",
    credentials: "fAMGCn8IVFAJA0ZZ"
}

const relay = new Relay.Peer2Peer<number>()
relay.on(NetworkEvent.MESSAGE, ({ message: count, session }) => {
    console.log(`Pong (${count})`)
    setTimeout(() => {
        relay.send(count + 1, session)
    }, 1000)
})

const client = new Client.Peer2Peer<number>()
client.on(NetworkEvent.CONNECT, () => {
    client.send(0)
})
client.on(NetworkEvent.MESSAGE, ({ message: count }) => {
    console.log(`Ping (${count})`)
    setTimeout(() => {
        client.send(count + 1)
    }, 1000)
})

const host = document.createElement("button")
host.innerText = "Host"
host.onclick = () => {
    host.innerText = "Hosting..."
    relay.start({ id: "example-host-id", ice })
    connect.remove()
}
document.body.prepend(host)
const connect = document.createElement("button")
connect.innerText = "Connect"
connect.onclick = () => {
    connect.innerText = "Connecting..."
    client.connect({ id: "example-host-id", ice })
    host.remove()
}
document.body.prepend(connect)
