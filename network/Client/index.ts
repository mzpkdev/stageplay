export * from "./Client"

import _Client from "./Client"
import _PoorSocketClient from "./PoorSocketClient"
import _Peer2PeerClient from "./Peer2PeerClient"


abstract class Client<TMessage = unknown> extends _Client<TMessage> {}

namespace Client {
    export type PoorSocket<TMessage> = _PoorSocketClient<TMessage>
    export const PoorSocket = _PoorSocketClient

    export type Peer2Peer<TMessage> = _Peer2PeerClient<TMessage>
    export const Peer2Peer = _Peer2PeerClient
}


export default Client
