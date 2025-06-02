export type Spectator = any
export type Snapshot = any
export type History = any


// @ts-ignore
const spectator: Spectator
// @ts-ignore
const snapshot: Spectator
// @ts-ignore
const history: Spectator

/**
    Requirements:
        1. There must be a separation between confirmed and unconfirmed snapshots
        2. There must be a history of previous confirmed snapshots in order for lag compensation to work
        3. When confirming a previously sent snapshot it cannot discard the unconfirmed one

    Option A: Active Snapshot | Archived Snapshot
        1. Start with an empty active snapshot
        2. Populate active snapshot with actants
        3. Diff active snapshot against previously archived one
        4. Send active snapshot and do not wait for confirmation
        5. Keep updating active snapshot with data
        6. When ACK comes confirm invalid snapshot :(
        Notes: Sent snapshot must wait for confirmation

    Option B: Active Snapshot | Pending Snapshot | Archived Snapshot
        1. Start with an empty active snapshot
        2. Populate active snapshot with actants
        3. Diff active snapshot against previously archived one (what about pending ones :<)
        4. Send active snapshot and do not wait for confirmation
        5. Turn active snapshot into pending snapshot
        6. Create new empty active snapshot
        7. Keep updating new active snapshot with data
        8. When ACK comes confirm any pending snapshot that were previously sent before the ACK (compare timestamps)

    Option C: Active Snapshot | Pending Snapshot | Archived Snapshot
        1. Start with an empty active snapshot
        2. Populate active snapshot with actants
        3. Diff active snapshot against previously archived one and last pending one
        4. Send active snapshot and do not wait for confirmation
        5. Turn active snapshot into pending snapshot
        6. Create new empty active snapshot
        7. Keep updating new active snapshot with data
        8. When ACK comes confirm any pending snapshot that were previously sent before the ACK (compare timestamps)


    UDP Hell:
        1.  Browser -> Packet 23 -> Server
        2.  Browser -> Packet 24 -> Server (Late)
        3.  Browser -> Packet 25 -> Server (Lost)
        4.  Browser -> Packet 26 -> Server (Early)
        5.  Server <- Packet 26
        6.  | Server knows Packet 26 is out-of-order, it waits up to 10ms for Packet 24 & 25
        7.  | Server did not receive Packet 24 & 25 before 10ms were up
        8.  Server -> Packet 27 -> Browser
        9.  Browser <- Packet 27
        10. | Browser knows that Packet 24 & 25 were discarded
        11. Browser -> Packet 28
        12. Server <- Packet 24
        13. | Server knows Packet 24 can be ignored as current sequence is 27
        14. Server <- Packet 28
        15. | Server knows Packet 28 is legit

 */

/*

    Todo:
        1. Extract `difference` and `merge` from Snapshot
        2. Update properties of Snapshot
        3. Implement Timeline
        4. Update logic for Spectator to use Timeline and updated Snapshot


    Snapshot {
        sequence: number
        contains: number[]
        data: Packet[]
    }

    update() {
        this.buffer.snap(actant)
    }

    pull(snapshot) {
        this.timeline.commit(snapshot) // <- commits to history this snapshot and ones included in `contains` property
        // what if server got more packets before he sent the ack?
    }

    push() {
        const delta = difference(this.buffer, last(this.timeline.history), last(this.timeline.pending))
        this.timeline.stage(delta)
        this.buffer = new Snapshot()
        send(delta)
    }

 */

/*
                    Browser -> Packet A
                    Browser -> Packet B (Lost)
                    Browser -> Packet C (Lost)
                    Packet A -> Server
                    Server -> Ack D
                    Browser thinks B and C are valid because A got late ACK
                    Solution?:
                        A: ACK explicitly
                        B: Verify sequence?
                           Server receive Packet A with Seq=32
                           Server sends ACK Packet D with Seq=33
                           What happens now to Packet B and Packet D
                 */

class Timestream {
    #_staged: Snapshot[] = []
    #_history: Snapshot[] = []

    stage(snapshot: Snapshot): this {
        return this
    }

    commit(timestamp: number): this {
        return this
    }

    get staged() {
        return this.#_staged
    }

    get history() {
        return this.#_history
    }
}

/*

    A (x=0;y=0;)
    B (x=0;y=0;)

    B (y=1;)

    A (x=1;y=1;)


 */
