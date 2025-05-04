import type * as Peer from "peerjs"
import Encoder from "@/network/Encoder"
import Session from "./Session"


class Peer2PeerSession extends Session {
    #_id: string
    #_connection: Peer.DataConnection

    constructor(connection: Peer.DataConnection) {
        super()
        this.#_connection = connection
        this.#_id = connection.peer
    }

    send(message: unknown): this {
        const encoded = Encoder.encode(message)
        const base64 = btoa(String.fromCharCode(...new Uint8Array(encoded)))
        this.#_connection.send(base64)
        return this
    }

    close(): this {
        this.#_connection.close()
        return this
    }

    get id() {
        return this.#_id
    }

    get alive() {
        return this.#_connection.open
    }
}


export default Peer2PeerSession
