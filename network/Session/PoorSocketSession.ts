import type * as sockjs from "sockjs"
import { crypto } from "@/common"
import Encoder from "@/network/Encoder"
import Session from "./Session"


class PoorSocketSession extends Session {
    #_id: string
    #_connection: sockjs.Connection | globalThis.WebSocket

    constructor(connection: sockjs.Connection | globalThis.WebSocket) {
        super()
        this.#_connection = connection
        const urlParams = new URLSearchParams(connection.url.split('?')[1])
        const id = urlParams.get('session_id')
        if (!id) {
            throw "WOLOLOLO"
        }
        this.#_id = id
    }

    send(message: unknown): this {
        const encoded = Encoder.encode(message)
        const base64 = btoa(String.fromCharCode(...new Uint8Array(encoded)))
        if ("write" in this.#_connection) {
            (this.#_connection as sockjs.Connection).write(base64)
        }
        if ("send" in this.#_connection) {
            (this.#_connection as globalThis.WebSocket).send(base64)
        }
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
        return this.#_connection.readyState === 1
    }
}


export default PoorSocketSession
