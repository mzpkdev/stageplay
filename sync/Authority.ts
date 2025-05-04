import { Backstage } from "@/system"
import Snapshot from "@/sync/Snapshot"


class Authority {
    #_backstage: Backstage

    constructor(backstage: Backstage) {
        this.#_backstage = backstage
    }

    verify(snapshot: Snapshot): boolean {
        return true
    }
}


export default Authority
