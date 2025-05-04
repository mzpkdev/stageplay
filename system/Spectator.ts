import { Scheduler } from "@/common"
import { Session } from "@/network"
import { Authority, History, Snapshot } from "@/sync"
import Area from "@/system/Area"
import { Actor } from "@/system/Actant"


class Spectator {
    #_session: Session<Snapshot>
    #_authority: Authority
    #_scheduler: Scheduler = new Scheduler(250)
    #_history: History = new History()
    #_state = {
        initialized: false
    }

    get id() {
        return this.#_session.id
    }

    constructor(session: Session, authority: Authority) {
        this.#_session = session
        this.#_authority = authority
    }

    spotlightActors(area: Area): Iterable<Actor> {
        return area
            .within(0, 0)
            .radius(10)
            .find()
    }

    update(actor: Actor): this {
        if (!this.#_state.initialized) {
            this.#_prepare()
            return this
        }
        this.#_history.snap(actor)
        return this
    }

    // todo: tightly coupled to multi-player games
    process(snapshot: Snapshot): this {
        this.#_history.commit()
        const valid = this.#_authority.verify(snapshot)
        if (valid) {
            const update = this.#_history.recent.merge(snapshot)
            this.#_history.archive(update)
        }
        return this
    }

    readonly #_synchronize = (): void => {
        // const { recent, previous } = this.#_snapshot
        // const differenced = recent.difference(previous)
        // this.#_session.send(differenced)
        // this.#_snapshot.archive(new Snapshot())

        const uncommitted = this.#_history
            .uncommitted()
            .difference(this.#_history.recent)
        this.#_session.send(uncommitted)
    }

    readonly #_prepare = (): void => {
        // todo: this doesn't need to run for single-player games
        this.#_scheduler
            .start()
            .schedule(() => this.#_synchronize())

        // this.#_session.on(Event.MESSAGE, (snapshot) => {
        //     this.#_snapshot.commit()
        //     if (this.#_authority.verify(snapshot)) {
        //         const update = this.#_snapshot.recent.merge(snapshot)
        //         this.#_snapshot.archive(update)
        //     }
        // })
        this.#_state.initialized = true
    }
}


export default Spectator
