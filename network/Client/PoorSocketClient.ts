// @ts-ignore
import SockJSClient from "sockjs-client/dist/sockjs"
import type * as SockJS from "sockjs-client"
import { LogEvent } from "@/logging"
import { Logger } from "@/common"
import NetworkEvent from "@/network/NetworkEvent"
import Encoder from "@/network/Encoder"
import Session from "@/network/Session"
import Client from "./Client"


export type Connection = {
    url: string
}

class PoorSocketClient<TMessage> extends Client<TMessage> {
    #_logger: Logger = new Logger("Client")

    #_client?: globalThis.WebSocket = undefined

    connect(connection: Connection): this {
        const client = new SockJSClient(`${connection.url}?session_id=${this.id}`)
        this.#_client = client
        setTimeout(() => {
            this.emit(NetworkEvent.OPEN, {})
            this.#_logger.use(LogEvent.Emit(NetworkEvent.OPEN, {}))
        })
        client.onopen = () => {
            const session = new Session.PoorSocket(client)
            this.emit(NetworkEvent.CONNECT, { session })
            this.#_logger.use(LogEvent.Emit(NetworkEvent.CONNECT, session))
            client.onmessage = (event: SockJS.MessageEvent) => {
                const base64 = event.data
                const uint8array = new Uint8Array(
                    atob(base64)
                        .split("")
                        .map(c => c.charCodeAt(0))
                )
                const message = Encoder.decode(uint8array) as TMessage
                this.emit(NetworkEvent.MESSAGE, { session, message })
                session.emit(NetworkEvent.MESSAGE, message)
                this.#_logger.use(LogEvent.Emit(NetworkEvent.MESSAGE, session))
            }
            client.onclose = () => {
                this.emit(NetworkEvent.CLOSE, { session })
                this.emit(NetworkEvent.DISCONNECT, { session })
                session.emit(NetworkEvent.CLOSE, {})
                this.#_logger.use(LogEvent.Emit(NetworkEvent.CLOSE, session))
                this.#_logger.use(LogEvent.Emit(NetworkEvent.DISCONNECT, session))
            }
            client.onerror = () => {
                this.emit(NetworkEvent.ERROR, { session })
                this.emit(NetworkEvent.DISCONNECT, { session })
                session.emit(NetworkEvent.ERROR, {})
                this.#_logger.use(LogEvent.Emit(NetworkEvent.ERROR, session))
                this.#_logger.use(LogEvent.Emit(NetworkEvent.DISCONNECT, session))
            }
        }
        return this
    }

    reconnect(): this {
        return this
    }

    send(message: TMessage): this {
        if (this.#_client) {
            const encoded = Encoder.encode(message)
            const base64 = btoa(String.fromCharCode(...new Uint8Array(encoded)))
            this.#_client.send(base64)
        }
        return this
    }
}


export default PoorSocketClient
