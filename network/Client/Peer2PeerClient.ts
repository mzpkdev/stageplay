import * as peerjs from "peerjs"
import { LogEvent } from "@/logging"
import { Logger } from "@/common"
import NetworkEvent from "@/network/NetworkEvent"
import Encoder from "@/network/Encoder"
import Session from "@/network/Session"
import Client from "./Client"


export type Connection = {
    id: string
    ice: {
        url: string
        username: string
        credentials: string
    }
}

class Peer2PeerClient<TMessage> extends Client<TMessage> {
    #_logger: Logger = new Logger("Client")

    static RECONNECTION_LIMIT = 10
    static RECONNECTION_DELAY = 1000

    #_connection?: Connection
    #_client?: peerjs.DataConnection

    connect(connection: Connection): this {
        const ice = {
            urls: connection.ice.url,
            username: connection.ice.username,
            credential: connection.ice.credentials
        }
        const peer = new peerjs.Peer(this.id, {
            debug: 0,
            config: {
                iceServers: [ ice ]
            }
        })
        peer.on("open", (_id: string) => {
            this.#_client = peer.connect(connection.id)
            this.emit(NetworkEvent.OPEN, {})
            this.#_logger.use(LogEvent.Emit(NetworkEvent.OPEN, {}))
            const session = new Session.Peer2Peer(this.#_client)
            this.#_client.on("open", () => {
                this.emit(NetworkEvent.CONNECT, { session })
                this.#_logger.use(LogEvent.Emit(NetworkEvent.CONNECT, session))

            })
            this.#_client.on("data", (buffer: unknown) => {
                const base64 = buffer as string
                const uint8array = new Uint8Array(
                    atob(base64)
                        .split("")
                        .map(c => c.charCodeAt(0))
                )
                const message = Encoder.decode(uint8array) as TMessage
                this.emit(NetworkEvent.MESSAGE, { session, message })
                session.emit(NetworkEvent.MESSAGE, message)
                this.#_logger.use(LogEvent.Emit(NetworkEvent.MESSAGE, session))
            })
            this.#_client.on("close", () => {
                this.emit(NetworkEvent.CLOSE, { session })
                this.emit(NetworkEvent.DISCONNECT, { session })
                session.emit(NetworkEvent.CLOSE, {})
                this.#_logger.use(LogEvent.Emit(NetworkEvent.CLOSE, session))
                this.#_logger.use(LogEvent.Emit(NetworkEvent.DISCONNECT, session))
                retry()
            })
            this.#_client.on("error", () => {
                this.emit(NetworkEvent.ERROR, { session })
                this.emit(NetworkEvent.DISCONNECT, { session })
                session.emit(NetworkEvent.ERROR, {})
                this.#_logger.use(LogEvent.Emit(NetworkEvent.ERROR, session))
                this.#_logger.use(LogEvent.Emit(NetworkEvent.DISCONNECT, session))
                retry()
            })
        })
        const retry = (() => {
            let retries = 0
            return () => {
                if (retries < Peer2PeerClient.RECONNECTION_LIMIT) {
                    const delay = Math.min(Peer2PeerClient.RECONNECTION_DELAY * Math.pow(2, retries), 30000)
                    setTimeout(() => {
                        this.reconnect()
                    }, delay)
                }
            }
        })()
        return this
    }

    reconnect(): this {
        if (this.#_connection) {
            this.connect(this.#_connection)
        }
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

export default Peer2PeerClient
