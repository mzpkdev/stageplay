import { object } from "@/common"
import { Encoder } from "@/network"
import PacketValue from "@/netcode/Packet/PacketValue"


class Packet {
    #_id: string
    #_type: string
    #_origin: string
    #_deleted?: boolean
    #_data?: Record<string, PacketValue>
    #_size: number = 0

    constructor(id: string, type: string, origin: string) {
        this.#_id = id
        this.#_type = type
        this.#_origin = origin
    }

    get id() {
        return this.#_id
    }

    get type() {
        return this.#_type
    }


    get origin() {
        return this.#_origin
    }


    get deleted() {
        return this.#_deleted
    }

    set deleted(value: boolean | undefined) {
        this.#_deleted = value
    }

    get data() {
        return this.#_data
    }

    set data(value: Record<string, PacketValue> | undefined) {
        this.#_data = value
    }

    get size() {
        return this.#_size
    }

    get(key: string): PacketValue {
        return this.#_data?.[key]
    }

    set(key: string, value: PacketValue): this {
        this.#_data = this.#_data ?? {}
        this.#_data[key] = value
        this.#_size = this.#_size + 1
        return this
    }

    copy() {
        const { id, type, origin, deleted, data } = this
        const copy = new Packet(id, type, origin)
        if (deleted) {
            copy.#_deleted = true
        }
        if (data) {
            copy.#_data = { ...data }
        }
        return copy
    }

    merge(packet: Packet, ...packets: Packet[]): Packet {
        const { id, type, origin } = this
        const empty = new Packet(id, type, origin)
        const merged = this["@@merge"](empty, packet)
        return packets.reduce((merged, packet) => {
            return this["@@merge"](merged, packet)
        }, merged)
    }

    difference(packet: Packet, ...packets: Packet[]): Packet {
        const { id, type, origin } = this
        const empty = new Packet(id, type, origin)
        const differenced = this["@@difference"](empty, packet)
        return packets.reduce((differenced, packet) => {
            return this["@@difference"](differenced, packet)
        }, differenced)
    }

    ["@@merge"](target: Packet, packet: Packet): Packet {
        if (packet.#_data !== undefined) {
            target.#_data = target.#_data ?? {}
            for (const key in packet.#_data) {
                target.#_data[key] = packet.#_data[key]
            }
        }
        return target
    }

    ["@@difference"](target: Packet, packet: Packet): Packet {
        if (packet.#_data !== undefined) {
            target.data = this.#_data ?? {}
            for (const key in packet.#_data) {
                if (!Object.prototype.hasOwnProperty.call(this.#_data, key)) {
                    continue
                }
                if (object.id(this.get(key)) !== object.id(packet.get(key))) {
                    const value = this.get(key)
                    if (value !== undefined) {
                        target.set(key, value)
                    }
                }
            }
        }
        return target
    }

    * [Symbol.iterator]() {
        for (const key in this.#_data) {
            if (!Object.prototype.hasOwnProperty.call(this.#_data, key)) {
                continue
            }
            yield this.#_data[key]
        }
    }
}

Encoder.extension.register({
    type: 2,
    encode(object) {
        if (object instanceof Packet) {
            const { id, type, origin, deleted, data } = object
            const buffer: Record<string, unknown> = { id, type, origin }
            if (deleted) {
                buffer.deleted = true
            }
            if (data) {
                buffer.data = data
            }
            return Encoder.encode(buffer)
        }
        return null
    },
    decode(buffer) {
        const { id, type, origin, deleted, data } = Encoder.decode(buffer) as Packet
        const packet = new Packet(id, type, origin)
        if (deleted) {
            packet.deleted = true
        }
        for (const key in data) {
            packet.set(key, data[key])
        }
        return packet
    }
})


export default Packet
