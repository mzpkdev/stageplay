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
    sequence: number
    contains: number[]
    timestamp: number
    state: Packet[]
}

class Snapshot {
    static from(object: PlainObject): Snapshot {
        const snapshot = new Snapshot()
        snapshot.#_sequence = object.sequence
        snapshot.#_contains = object.contains
        snapshot.#_timestamp = object.timestamp
        snapshot.#_state = KeyedSet.from(packet => packet.id, object.state)
        return snapshot
    }


    #_sequence: number
    #_contains: number[] = []
    #_timestamp: number = Date.now()
    #_state: KeyedSet<Packet> = new KeyedSet(packet => packet.id)

    constructor(sequence: number = 0, contains: number[] = []) {
        this.#_sequence = sequence
        this.#_contains = contains
    }


    get sequence() {
        return this.#_sequence
    }

    set sequence(value: number) {
        this.#_sequence = value
    }

    get contains() {
        return this.#_contains
    }

    set contains(value: number[]) {
        this.#_contains = value
    }

    get timestamp() {
        return this.#_timestamp
    }

    set  (value: number) {
        this.#_timestamp = value
    }

    get state() {
        return this.#_state
    }

    snap(actant: Actant): this {
        const packet = new Packet(actant.id, actant.type, actant.origin)
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
        snapshot.sequence = this.#_sequence
        snapshot.contains = this.#_contains.slice()
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
                const deleted = new Packet(packet.id, packet.type, packet.origin)
                deleted.deleted = true
                snapshot.#_state.add(deleted)
            }
        }
        snapshot.sequence = this.#_sequence
        snapshot.contains = this.#_contains.slice()
        return snapshot
    }
}

Encoder.extension.register({
    type: 1,
    encode(object) {
        if (object instanceof Snapshot) {
            const { sequence, contains, timestamp, state } = object
            return Encoder.encode({ sequence, contains, timestamp, state: Array.from(state) })
        }
        return null
    },
    decode(buffer) {
        const object = Encoder.decode(buffer) as PlainObject
        return Snapshot.from(object)
    }
})


export default Snapshot
