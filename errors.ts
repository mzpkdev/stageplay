import { type Session } from "@/network"


export class NonExistentSession extends Error {
    static readonly name = ""
    readonly message = ``

    constructor(session: Session) {
        super()
    }
}