import { Logger, Scheduler } from "@/common"
import { Session } from "@/network"
import { Authority, History, Snapshot } from "../netcode"
import Area from "@/system/Area"
import { Actor } from "@/system/Actant"
import Timeline from "@/netcode/Timeline"


class Spectator {
    #_logger = new Logger("Spectator")

    #_session: Session<Snapshot>
    #_scheduler: Scheduler = new Scheduler(2500)
    #_buffer: Snapshot = new Snapshot()
    #_timeline: Timeline = new Timeline()
    #_state = {
        initialized: false
    }

    get id() {
        return this.#_session.id
    }

    constructor(session: Session, _authority: Authority) {
        this.#_session = session
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
        this.#_buffer.snap(actor) // looks good, adding to buffer
        return this
    }

    process(delta: Snapshot): this {
        console.log(`Processing (seq=${delta.sequence};size=${delta.state.size};)`)
        // console.log(JSON.stringify(Array.from(delta.state).map(x => ({ id: x.id, type: x.type, data: x.data })), null, 2))
        if (delta.sequence < this.#_buffer.sequence) {
            console.log(`Weird edge case`)
            return this
        }
        this.#_buffer.sequence = delta.sequence + 1
        this.#_buffer.contains.push(delta.sequence)
        this.#_timeline.commit(delta.contains)
        const previous = this.#_timeline.history.at(-1) ?? new Snapshot()
        const merged = new Snapshot().merge(previous).merge(delta)
        merged.sequence = delta.sequence
        merged.contains = delta.contains.slice()
        this.#_timeline.stage(merged)
        console.log(`Commiting (seq=${merged.sequence};size=${merged.state.size};) prev=${previous.sequence}|${previous.state.size}`)
        this.#_timeline.commit([merged.sequence])
        return this
    }

    readonly #_synchronize = (): void => {
        const previous = this.#_timeline.history.at(-1) ?? new Snapshot()
        let delta = new Snapshot().merge(this.#_buffer).difference(new Snapshot().merge(previous))
        // delta = delta.difference(new Snapshot().merge(this.#_buffer))
        delta.sequence = this.#_buffer.sequence
        delta.contains = this.#_buffer.contains.slice()
        console.log(`Diffing (seq=${delta.sequence};size=${delta.state.size};) prev=${previous.sequence}|${previous.state.size}`)
        this.#_session.send(delta)
        this.#_timeline.stage(this.#_buffer)
        this.#_buffer = new Snapshot()
        this.#_buffer.sequence = delta.sequence + 1
    }

    readonly #_prepare = (): void => {
        this.#_scheduler
            .start()
            .schedule(() => this.#_synchronize())
        this.#_state.initialized = true
    }
}



// process(snapshot: Snapshot): this {
//     console.log(`Processing snapshot (sequence=${snapshot.sequence};size=${snapshot.state.size})`)
//
//     if (snapshot.sequence < this.#_buffer.sequence) {
//         console.log(`Weird edge case`)
//         return this
//     }
//     // Because we just receive a snapshot, we must bump our buffer sequence to the next one to avoid collision
//     this.#_buffer.sequence = snapshot.sequence + 1
//     // Adding it to the ACK array
//     this.#_buffer.contains.push(snapshot.sequence)
//     const prevs = [...this.#_timeline.history, ...this.#_timeline.staged]
//     const merged = this.#_timeline.all()        // ?
//     console.log("WOOT", merged.state.size)
//     merged.sequence = snapshot.sequence
//     merged.contains = snapshot.contains.slice()
//     this.#_timeline.commit(merged)
//     console.log(`Prev sizes: ${prevs.map(s => `seq:${s.sequence}=${s.state.size}`).join(', ')}`)
//     console.log(`Merged (sequence=${merged.sequence};contains=${merged.contains.join(",")};size=${snapshot.state.size})`)
//     return this
// }
//
// readonly #_synchronize = (): void => {
//     const previous = this.#_timeline.history.at(-1)
//     if (!previous) {
//         console.log(`Synchronizing for the first time, sending an full snapshot`)
//         // Adding buffer to staging/pending
//         this.#_timeline.stage(this.#_buffer)
//         // Sending full snapshot
//         this.#_session.send(this.#_buffer)
//         // Starting new snapshot
//         this.#_buffer = new Snapshot()
//         // Setting new snapshot sequence to the next one (can be updated)
//         this.#_buffer.sequence = 1
//         return
//     }
//     console.log(`Synchronizing delta with previous (sequence=${previous.sequence};size=${previous.state.size})`)
//     // Now we know what we sent before, we can now calculate delta
//     // We take the current buffer and  diff it with what we received from the client    <- ?
//     const delta = this.#_buffer.difference(previous)
//     // Misc - Setting sequence and contains to match buffers
//     delta.sequence = this.#_buffer.sequence
//     delta.contains = this.#_buffer.contains
//     // Adding delta to pending snapshots
//     this.#_timeline.stage(delta)
//     // Sending delta snapshot
//     console.log(`Sending delta snapshot (sequence=${delta.sequence};size=${delta.state.size}) { ${Array.from(delta.state).map(packet => packet.type).join(", ")} }`)
//     this.#_session.send(delta)
//     // Starting a new buffer
//     this.#_buffer = new Snapshot()
//     // Setting its sequence to the next one
//     this.#_buffer.sequence = delta.sequence + 1
// }

// class Spectator {
//     #_logger = new Logger("Spectator")
//
//     #_session: Session<Snapshot>
//     #_authority: Authority
//     #_scheduler: Scheduler = new Scheduler(2500)
//     #_history: History = new History()
//     #_state = {
//         initialized: false
//     }
//
//     get id() {
//         return this.#_session.id
//     }
//
//     constructor(session: Session, authority: Authority) {
//         this.#_session = session
//         this.#_authority = authority
//     }
//
//     spotlightActors(area: Area): Iterable<Actor> {
//         return area
//             .within(0, 0)
//             .radius(10)
//             .find()
//     }
//
//     update(actor: Actor): this {
//         if (!this.#_state.initialized) {
//             this.#_prepare()
//             return this
//         }
//         this.#_history.pending.snap(actor) // looks good, adding to buffer
//         return this
//     }
//
//     // todo: tightly coupled to multi-player games
//     process(snapshot: Snapshot): this {
//         const valid = this.#_authority.verify(snapshot)
//         if (valid) {
//             const update = this.#_history.recent.merge(snapshot)
//             this.#_history.archive(update)
//         }
//         return this
//     }
//
//     readonly #_synchronize = (): void => {
//         // const { recent, previous } = this.#_snapshot
//         // const differenced = recent.difference(previous)
//         // this.#_session.send(differenced)
//         // this.#_snapshot.archive(new Snapshot())
//
//         const uncommitted = this.#_history
//             .uncommitted() // looks good, buffered - last confirmed
//             .difference(this.#_history.recent)
//             // .merge(this.#_history.pending)
//
//         console.log(Array.from(uncommitted.state)
//             .map(({ id, type, data }) =>
//                 ({ id, type, data })))
//
//         this.#_session.send(uncommitted)
//         this.#_history.commit() // acking current buffer?
//     }
//
//     readonly #_prepare = (): void => {
//         // todo: this doesn't need to run for single-player games
//         this.#_scheduler
//             .start()
//             .schedule(() => this.#_synchronize())
//
//         // this.#_session.on(Event.MESSAGE, (snapshot) => {
//         //     this.#_snapshot.commit()
//         //     if (this.#_authority.verify(snapshot)) {
//         //         const update = this.#_snapshot.recent.merge(snapshot)
//         //         this.#_snapshot.archive(update)
//         //     }
//         // })
//         this.#_state.initialized = true
//     }
// }


export default Spectator
