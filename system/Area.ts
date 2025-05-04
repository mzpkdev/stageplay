import { Actor } from "@/system/Actant"
import Backstage from "@/system/Backstage"


class Area {
    #_registry: Backstage
    #_query = {
        x: 0,
        y: 0,
        radius: 0
    }

    constructor(registry: Backstage) {
        this.#_registry = registry
    }

    within(x: number, y: number): this {
        this.#_query.x = x
        this.#_query.y = y
        return this
    }

    radius(radius: number): this {
        this.#_query.radius = radius
        return this
    }

    find(): Iterable<Actor> {
        return this.#_registry
    }
}


export default Area
