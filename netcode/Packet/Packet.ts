import { object } from "@/common"
import { Encoder } from "@/network"
import PacketValue from "@/netcode/Packet/PacketValue"


class Packet {
    #_id: string = ""
    #_type: string = ""
    #_origin: string = ""
    #_deleted?: boolean
    #_data?: Record<string, PacketValue>
    #_size: number = 0

    get id() {
        return this.#_id
    }

    set id(value: string) {
        this.#_id = value
    }

    get type() {
        return this.#_type
    }

    set type(value: string) {
        this.#_type = value
    }

    get origin() {
        return this.#_origin
    }

    set origin(value: string) {
        this.#_origin = value
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

    set size(value: number) {
        this.#_size = value
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

    merge(recent: Packet): Packet {
        const packet = new Packet()
        packet.#_id = recent.#_id
        packet.#_type = recent.#_type
        packet.#_origin = recent.#_origin
        if (recent.#_deleted) {
            packet.#_deleted = true
        } else {
            packet.#_deleted = undefined
        }
        packet.#_data = this.#_data
        for (const key in recent.#_data) {
            packet.set(key, recent.#_data[key])
        }
        return packet
    }

    difference(packet: Packet): Packet {
        const differenced = new Packet()
        differenced.#_id = this.#_id
        differenced.#_type = this.#_type
        differenced.#_origin = this.#_origin
        if (this.#_deleted) {
            differenced.#_deleted = true
            return differenced
        }
        for (const key in this.#_data) {
            if (!Object.prototype.hasOwnProperty.call(this.#_data, key)) {
                continue
            }
            if (object.id(this.get(key)) !== object.id(packet.get(key))) {
                const value = this.get(key)
                if (value !== undefined) {
                    differenced.set(key, value)
                }
            }
        }
        return differenced
    }
}

Encoder.extension.register({
    type: 2,
    encode(object) {
        if (object instanceof Packet) {
            const buffer: Record<string, unknown> = {}
            buffer.id = object.id
            buffer.type = object.type
            buffer.origin = object.origin
            if (object.deleted) {
                buffer.deleted = true
            }
            if (object.data) {
                buffer.data = object.data
            }
            return Encoder.encode(buffer)
        }
        return null
    },
    decode(buffer) {
        type PlainObject = {
            id: string
            type: string
            origin: string
            deleted?: boolean
            data?: Record<string, PacketValue>
        }
        const object = Encoder.decode(buffer) as PlainObject
        const packet = new Packet()
        packet.id = object.id
        packet.type = object.type
        packet.origin = object.origin
        if (object.deleted) {
            packet.deleted = true
        }
        for (const key in object.data) {
            packet.set(key, object.data[key])
        }
        return packet
    }
})


export default Packet
