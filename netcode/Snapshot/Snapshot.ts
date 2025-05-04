import { EventEmitter, KeyedSet } from "@/common"
import { Encoder } from "@/network"
import { Actant, Actor, Prop } from "@/system"
import Packet, { PacketValue } from "@/netcode/Packet"


const RESERVED_PROPERTIES = new Set([
    ...Object.getOwnPropertyNames(Actant.create()),
    ...Object.getOwnPropertyNames(Actor.create()),
    ...Object.getOwnPropertyNames(Prop.create())
])


type PlainObject = {
    timestamp: number
    state: Packet[]
}

class Snapshot {
    static from(object: PlainObject): Snapshot {
        const snapshot = new Snapshot()
        snapshot.#_timestamp = object.timestamp
        snapshot.#_state = KeyedSet.from(packet => packet.id, object.state)
        return snapshot
    }


    #_timestamp: number = Date.now()
    #_state: KeyedSet<Packet> = new KeyedSet(packet => packet.id)

    get timestamp() {
        return this.#_timestamp
    }

    set timestamp(value: number) {
        this.#_timestamp = value
    }

    get state() {
        return this.#_state
    }

    snap(actant: Actant): this {
        const packet = new Packet()
        packet.id = actant.id
        packet.type = actant.type
        packet.origin = actant.origin
        for (const property in actant) {
            if (!Object.prototype.hasOwnProperty.call(actant, property)) {
                continue
            }
            if (RESERVED_PROPERTIES.has(property)) {
                continue
            }
            const value: Actant | PacketValue =
                actant[property as keyof Omit<Actor, keyof EventEmitter>]
            packet.data = packet.data ?? {}
            if (Actant.isActant(value)) {
                packet.data[property] = new PacketValue.Ref(value.id)
                this.snap(value)
                continue
            }
            packet.data[property] = value
        }
        this.#_state.add(packet)
        return this
    }

    merge(recent: Snapshot): Snapshot {
        const snapshot = new Snapshot()
        snapshot.#_state = this.state
        for (const packet of recent.#_state) {
            const existing = this.#_state.get(packet.id)
            if (existing) {
                const merged = existing.merge(packet)
                snapshot.#_state.add(merged)
            } else {
                snapshot.#_state.add(packet)
            }
        }
        return snapshot
    }

    difference(previous: Snapshot): Snapshot {
        const snapshot = new Snapshot()
        for (const packet of this.#_state) {
            const existed = previous.#_state.get(packet.id)
            if (existed) {
                const differenced = packet.difference(existed)
                if (differenced.size > 0) {
                    snapshot.#_state.add(differenced)
                }
                continue
            }
            snapshot.#_state.add(packet)
        }
        for (const packet of previous.#_state) {
            const exists = this.#_state.get(packet.id)
            if (!exists) {
                const deleted = new Packet()
                deleted.id = packet.id
                deleted.type = packet.type
                deleted.origin = packet.origin
                deleted.deleted = true
                snapshot.#_state.add(deleted)
            }
        }
        return snapshot
    }
}

Encoder.extension.register({
    type: 1,
    encode(object) {
        if (object instanceof Snapshot) {
            const { timestamp, state } = object
            return Encoder.encode({ timestamp, state: Array.from(state) })
        }
        return null
    },
    decode(buffer) {
        const object = Encoder.decode(buffer) as PlainObject
        return Snapshot.from(object)
    }
})


export default Snapshot
