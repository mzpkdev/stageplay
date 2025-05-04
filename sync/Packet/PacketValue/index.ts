import PacketArray from "./PacketArray"
import PacketObject from "./PacketObject"
import PacketPrimitive from "./PacketPrimitive"
import PacketRef from "./PacketRef"


type PacketValue =
    | PacketPrimitive
    | PacketObject
    | PacketArray
    | PacketRef

namespace PacketValue {
    export type Primitive = PacketPrimitive
    export type Object = PacketObject
    export type Array = PacketArray
    export type Ref = PacketRef
    export const Ref = PacketRef
}


export default PacketValue
