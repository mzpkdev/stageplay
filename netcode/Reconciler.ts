import { Logger } from "@/common"
import { LogEvent } from "@/logging"
import { Actant, Backstage } from "@/system"
import Snapshot from "@/netcode/Snapshot"
import Packet, { PacketValue } from "@/netcode/Packet"


class Reconciler {
    #_logger: Logger = new Logger("Reconciler")

    #_backstage: Backstage

    constructor(backstage: Backstage) {
        this.#_backstage = backstage
    }

    reconcile(snapshot: Snapshot): void {
        const spawned = new Map<string, Actant>()
        const dereference = (reference: PacketValue.Ref): Actant | undefined => {
            const packet = snapshot.state.get(reference.id)
            if (packet) {
                const actant = spawn(packet)
                this.#_backstage.add(actant)
                return actant
            }
            const lastResort = this.#_backstage.get(reference.id)
            if (lastResort) {
                return lastResort
            }
            throw "UGABUGA"
        }
        const update = (actant: Actant, packet: Packet): void => {
            for (const key in packet.data) {
                if (!Object.prototype.hasOwnProperty.call(packet.data, key)) {
                    continue
                }
                let value: unknown = packet.get(key)
                if (value === undefined) {
                    continue
                }
                if (PacketValue.Ref.isPacketRef(value)) {
                    value = dereference(value)
                }
                Reflect.set(actant, key, value)
            }
        }
        const spawn = (packet: Packet) => {
            const Constructor = this.#_backstage.roles.get(packet.type)
            const actant = Actant.from(packet, Constructor)
            update(actant, packet)
            return actant
        }

        for (const packet of snapshot.state) {
            const actant = this.#_backstage.get(packet.id)
            if (actant) {
                update(actant, packet)
                this.#_logger.use(LogEvent.Receive("UPDATE", actant))
                continue
            }
            if (!spawned.has(packet.id)) {
                this.#_backstage.add(spawn(packet))
            }
        }
        for (const actant of spawned.values()) {
            this.#_backstage.add(actant)
        }
    }
}


export default Reconciler
