import { NonExistentSession } from "@/errors"
import { LogEvent } from "@/logging"
import { KeyedSet, Logger, Scheduler } from "@/common"
import Encoder from "@/network/Encoder"
import NetworkEvent from "@/network/NetworkEvent"
import Session from "@/network/Session"
import * as peerjs from "peerjs"
import Relay from "./Relay"


export type Configuration = {
    id: string
    ice: {
        url: string
        username: string
        credentials: string
    }
}

class Peer2PeerRelay<TMessage> extends Relay<TMessage> {
    #_logger: Logger = new Logger("Relay")

    #_scheduler: Scheduler = new Scheduler(Relay.TIME_BEFORE_DISCONNECT)
    #_sessions: KeyedSet<Session> = new KeyedSet(session => session.id)
    #_disconnected: Map<string, Scheduler.Task> = new Map()

    start(configuration: Configuration): this {
        const ice = {
            urls: configuration.ice.url,
            username: configuration.ice.username,
            credential: configuration.ice.credentials
        }
        const peer = new peerjs.Peer(configuration.id, {
            debug: 0,
            config: {
                iceServers: [ ice ]
            }
        })
        peer.on("open", () => {
            this.#_scheduler.start()
            this.emit(NetworkEvent.OPEN, {})
            this.#_logger.use(LogEvent.Emit(NetworkEvent.OPEN, {}))
        })
        peer.on("connection", (connection: peerjs.DataConnection) => {
            const session = new Session.Peer2Peer(connection)
            const disconnected = this.#_disconnected.get(session.id)
            if (disconnected) {
                this.#_disconnected.delete(session.id)
                this.#_scheduler.unschedule(disconnected)
                this.emit(NetworkEvent.RECONNECT, { session })
                this.#_logger.use(LogEvent.Emit(NetworkEvent.RECONNECT, session))
            } else {
                this.#_sessions.add(session)
                this.emit(NetworkEvent.CONNECT, { session })
                this.#_logger.use(LogEvent.Emit(NetworkEvent.CONNECT, session))
            }
            connection.on("data", (buffer: unknown) => {
                const uint8array = new Uint8Array(
                    atob(buffer as string)
                        .split("")
                        .map(character => character.charCodeAt(0))
                )
                const message = Encoder.decode(uint8array) as TMessage
                this.emit(NetworkEvent.MESSAGE, { session, message })
                session.emit(NetworkEvent.MESSAGE, message)
                this.#_logger.use(LogEvent.Emit(NetworkEvent.MESSAGE, session))
            })
            connection.on("close", () => {
                const task = this.#_scheduler.schedule(() => {
                    this.#_sessions.delete(session)
                    this.#_disconnected.delete(session.id)
                    this.#_scheduler.unschedule(task)
                    this.emit(NetworkEvent.DISCONNECT, { session })
                    this.#_logger.use(LogEvent.Emit(NetworkEvent.DISCONNECT, session))
                })
                this.#_disconnected.set(session.id, task)
                this.emit(NetworkEvent.CLOSE, { session })
                session.emit(NetworkEvent.CLOSE, {})
                this.#_logger.use(LogEvent.Emit(NetworkEvent.CLOSE, {}))
            })
            connection.on("error", () => {
                this.emit(NetworkEvent.ERROR, { session })
                session.emit(NetworkEvent.ERROR, {})
                this.#_logger.use(LogEvent.Emit(NetworkEvent.ERROR, {}))
            })
        })
        return this
    }

    send(message: TMessage, session: Session): this {
        if (!this.#_sessions.has(session)) {
            throw new NonExistentSession(session)
        }
        if (session.alive) {
            session.send(message)
        }
        return this
    }

    broadcast(message: TMessage): this {
        for (const session of this.#_sessions) {
            if (session.alive) {
                session.send(message)
            }
        }
        return this
    }

    get sessions() {
        return Array.from(this.#_sessions)
    }
}


export default Peer2PeerRelay
