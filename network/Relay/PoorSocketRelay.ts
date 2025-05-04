import { KeyedSet, Logger, Scheduler } from "@/common"
import type * as sockjs from "sockjs"
import NetworkEvent from "@/network/NetworkEvent"
import Session from "@/network/Session"
import Encoder from "@/network/Encoder"
import Relay from "./Relay"


export type Configuration = {
    port: number
    path: string
}

class PoorSocketRelay<TMessage> extends Relay<TMessage> {
    #_logger: Logger = new Logger("Relay")

    #_scheduler: Scheduler = new Scheduler(Relay.TIME_BEFORE_DISCONNECT)
    #_sessions: KeyedSet<Session> = new KeyedSet(session => session.id)
    #_disconnected: Map<string, Scheduler.Task> = new Map()

    start(configuration: Configuration): this {
        const http = require("http")
        const sockjs = require("sockjs")
        const server = http.createServer()
        const wss = sockjs.createServer()
        wss.installHandlers(server, { prefix: configuration.path })
        setTimeout(() => {
            this.emit(NetworkEvent.OPEN, {})
            this.#_logger.use(Logger.LOG_EVENT("NetworkEvent.OPEN", {}))
            this.#_scheduler.start()
        })
        wss.on("connection", (ws: sockjs.Connection) => {
            const session = new Session.PoorSocket(ws)
            const disconnected = this.#_disconnected.get(session.id)
            if (disconnected) {
                this.#_disconnected.delete(session.id)
                this.#_scheduler.unschedule(disconnected)
                this.emit(NetworkEvent.RECONNECT, { session })
                this.#_logger.use(Logger.LOG_EVENT("NetworkEvent.RECONNECT", { id: session.id }))
            } else {
                this.#_sessions.add(session)
                this.emit(NetworkEvent.CONNECT, { session })
                this.#_logger.use(Logger.LOG_EVENT("NetworkEvent.CONNECT", { id: session.id }))
            }
            ws.on("data", (buffer: string) => {
                const uint8array = new Uint8Array(
                    atob(buffer)
                        .split("")
                        .map(c => c.charCodeAt(0))
                )
                const message = Encoder.decode(uint8array) as TMessage
                this.emit(NetworkEvent.MESSAGE, { session, message })
                session.emit(NetworkEvent.MESSAGE, message)
                this.#_logger.use(Logger.LOG_EVENT("NetworkEvent.MESSAGE", { id: session.id }))
            })
            ws.on("close", () => {
                const task = this.#_scheduler.schedule(() => {
                    this.#_sessions.delete(session)
                    this.#_disconnected.delete(session.id)
                    this.#_scheduler.unschedule(task)
                    this.emit(NetworkEvent.DISCONNECT, { session })
                    this.#_logger.use(Logger.LOG_EVENT("NetworkEvent.DISCONNECT", { id: session.id }))
                })
                this.#_disconnected.set(session.id, task)
                this.emit(NetworkEvent.CLOSE, { session })
                session.emit(NetworkEvent.CLOSE, {})
                this.#_logger.use(Logger.LOG_EVENT("NetworkEvent.CLOSE", {}))
            })
            ws.on("error", () => {
                this.emit(NetworkEvent.ERROR, { session })
                session.emit(NetworkEvent.ERROR, {})
                this.#_logger.use(Logger.LOG_EVENT("NetworkEvent.ERROR", {}))
            })
        })
        server.listen(configuration.port, "0.0.0.0")
        return this
    }

    send(message: TMessage, session: Session): this {
        if (!this.#_sessions.has(session)) {
            throw new Error(`__MISSING_SESSION__`)
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


export default PoorSocketRelay
