import Snapshot from "@/netcode/Snapshot"
import { KeyedSet } from "@/common"


class Timeline {
    #_staged: KeyedSet<Snapshot> = new KeyedSet(snapshot => snapshot.sequence)
    #_history: KeyedSet<Snapshot> = new KeyedSet(snapshot => snapshot.sequence)

    stage(snapshot: Snapshot): this {
        this.#_staged.add(snapshot)
        return this
    }

    commit(sequences: number[]): this {
        for (const sequence of sequences) {
            const contained = this.#_staged.get(sequence)
            if (contained) {
                this.#_staged.delete(contained)
                this.#_history.add(contained)
            }
        }
        return this
    }

    get staged() {
        return this.#_staged
    }

    get history() {
        return this.#_history
    }

    all() {
        const all = [ ...this.#_history, ...this.#_staged ]
        return all.reduce((snapshot, next) => snapshot.merge(next), new Snapshot())
    }
}


export default Timeline
