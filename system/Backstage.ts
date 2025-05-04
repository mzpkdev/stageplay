import { KeyedSet } from "@/common"
import Actant from "@/system/Actant"


class Backstage {
    #_roles: KeyedSet<typeof Actant> = new KeyedSet(constructor => constructor.name)
    #_actants: KeyedSet<Actant> = new KeyedSet(actant => actant.id)

    get roles() {
        return this.#_roles
    }

    get size() {
        return this.#_actants.size
    }

    add(actant: Actant): this {
        this.#_actants.add(actant)
        return this
    }

    delete(actant: Actant): this {
        this.#_actants.delete(actant)
        return this
    }

    get(id: string): Actant | undefined {
        return this.#_actants.get(id)
    }

    has(actant: Actant): boolean {
        return this.#_actants.has(actant)
    }

    * [Symbol.iterator]() {
        for (const actant of this.#_actants) {
            yield actant
        }
    }
}


export default Backstage
