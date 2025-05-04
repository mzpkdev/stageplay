export * from "./Session"

import _Session from "./Session"
import _PoorSocketSession from "./PoorSocketSession"
import _Peer2PeerSession from "./Peer2PeerSession"


abstract class Session<TMessage = unknown> extends _Session<TMessage> {}
namespace Session {
    export type PoorSocket = _PoorSocketSession
    export const PoorSocket = _PoorSocketSession

    export type Peer2Peer = _Peer2PeerSession
    export const Peer2Peer = _Peer2PeerSession
}


export default Session
