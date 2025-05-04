import { crypto, EventEmitter } from "@/common"
import NetworkEvent from "@/network/NetworkEvent"
import Session from "@/network/Session"


type EventList<TMessage> = {
    [NetworkEvent.OPEN]: {}
    [NetworkEvent.CONNECT]: { session: Session }
    [NetworkEvent.RECONNECT]: { session: Session }
    [NetworkEvent.DISCONNECT]: { session: Session }
    [NetworkEvent.MESSAGE]: { session: Session, message: TMessage }
    [NetworkEvent.SEND]: { message: TMessage }
    [NetworkEvent.CLOSE]: { session: Session }
    [NetworkEvent.ERROR]: { session: Session }
}

abstract class Client<TMessage = unknown> extends EventEmitter<EventList<TMessage>> {
    #_id: string | undefined

    get id() {
        const key = "SESSION_ID"
        const persisted = localStorage.getItem(key)
        this.#_id = persisted ?? crypto.uuid()
        if (!persisted) {
            localStorage.setItem(key, this.#_id)
        }
        return this.#_id
    }

    abstract connect(connection: unknown): this
    abstract reconnect(): this
    abstract send(message: TMessage): this
}


export default Client
