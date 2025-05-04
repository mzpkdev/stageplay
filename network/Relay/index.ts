export * from "./Relay"

import _Relay from "./Relay"
import _PoorSocketRelay from "./PoorSocketRelay"
import _Peer2PeerRelay from "./Peer2PeerRelay"


abstract class Relay<TMessage = unknown> extends _Relay<TMessage> {}
namespace Relay {
    export type PoorSocket<TMessage> = _PoorSocketRelay<TMessage>
    export const PoorSocket = _PoorSocketRelay

    export type Peer2Peer<TMessage> = _Peer2PeerRelay<TMessage>
    export const Peer2Peer = _Peer2PeerRelay
}


export default Relay
