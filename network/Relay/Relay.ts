import { EventEmitter, Logger } from "@/common"
import Session from "@/network/Session"
import NetworkEvent from "@/network/NetworkEvent"


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

abstract class Relay<TMessage = unknown> extends EventEmitter<EventList<TMessage>> {
    static TIME_BEFORE_DISCONNECT = 10 * 1000

    abstract start(configuration: unknown): this
    abstract send(message: TMessage, session: Session): this
    abstract broadcast(message: TMessage): this
    abstract get sessions(): Session[]
}


export default Relay
