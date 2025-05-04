import { object } from "@/common"
import { Encoder } from "@/network"


namespace Symbol {
    export const isPacketRef = globalThis.Symbol()
}

class PacketRef {
    static isPacketRef(value: PacketRef | unknown): value is PacketRef {
        return object.isObject(value) && Symbol.isPacketRef in value
    }

    #_id: string

    constructor(id: string) {
        this.#_id = id
    }

    get id() {
        return this.#_id
    }

    [Symbol.isPacketRef](): boolean {
        return true
    }

    toString(): string {
        return `Ref(${this.#_id})`
    }
}


const encodeText = new TextEncoder()
const decodeText = new TextDecoder()
Encoder.extension.register({
    type: 3,
    encode(data) {
        if (data instanceof PacketRef) {
            return encodeText.encode(data.id)
        }
        return null
    },
    decode(data) {
        return new PacketRef(decodeText.decode(data))
    }
})


export default PacketRef
