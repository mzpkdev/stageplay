import { EventEmitter } from "@/common"
import NetworkEvent from "@/network/NetworkEvent"


type EventList<TMessage> = {
    [NetworkEvent.MESSAGE]: TMessage
    [NetworkEvent.CLOSE]: {}
    [NetworkEvent.ERROR]: {}
}

abstract class Session<TMessage = unknown> extends EventEmitter<EventList<TMessage>> {
    abstract send(message: TMessage): this
    abstract close(): this
    abstract get id(): string
    abstract get alive(): boolean
}


export default Session
