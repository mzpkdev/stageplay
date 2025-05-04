import { Actant } from "@/system"
import Snapshot from "@/netcode/Snapshot"


export class History {
    #_archived: Snapshot[]
    #_uncommitted: Snapshot[]

    get pending() {
        return this.#_uncommitted[0]
    }

    get recent() {
        return this.#_archived[0]
    }

    constructor() {
        this.#_archived = [ new Snapshot(), new Snapshot() ]
        this.#_uncommitted = [ new Snapshot() ]
    }

    snap(actant: Actant): this {
        this.pending.snap(actant)
        return this
    }

    commit(): this {
        this.#_archived.unshift(...this.#_uncommitted)
        this.#_uncommitted.splice(0, this.#_uncommitted.length)
        this.#_uncommitted.unshift(new Snapshot())
        return this
    }

    archive(snapshot: Snapshot): this {
        this.#_archived.unshift(snapshot)
        this.#_archived.splice(5)
        return this
    }

    uncommitted(): Snapshot {
        return this.#_uncommitted
            .reduceRight((snapshot, uncommitted) => snapshot.merge(uncommitted))
    }
}


export default History
