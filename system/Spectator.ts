import { Logger, Scheduler } from "@/common"
import { Session } from "@/network"
import { Authority, History, Snapshot } from "../netcode"
import Area from "@/system/Area"
import { Actor } from "@/system/Actant"
import { LogEvent } from "@/logging"


class Spectator {
    #_logger = new Logger("Spectator")

    #_session: Session<Snapshot>
    #_authority: Authority
    #_scheduler: Scheduler = new Scheduler(2500)
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
        this.#_history.pending.snap(actor) // looks good, adding to buffer
        return this
    }

    // todo: tightly coupled to multi-player games
    process(snapshot: Snapshot): this {
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
            .uncommitted() // looks good, buffered - last confirmed
            .difference(this.#_history.recent)
            // .merge(this.#_history.pending)

        console.log(Array.from(uncommitted.state)
            .map(({ id, type, data }) =>
                ({ id, type, data })))

        this.#_session.send(uncommitted)
        this.#_history.commit() // acking current buffer?
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
