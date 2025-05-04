import { crypto, object, EventEmitter } from "@/common"


namespace Symbol {
    export const isActant = globalThis.Symbol()
}

type PlainObject = {
    id: string
    type: string
    origin: string
}

class Actant extends EventEmitter {
    static isActant<TValue extends Actant>(value: TValue | unknown): value is TValue {
        return object.isObject(value) && Symbol.isActant in value
    }

    static create<TFigure extends Actant>(): TFigure {
        return new this() as TFigure
    }

    static from(object: PlainObject, Constructor: typeof Actant = Actant): Actant {
        const instance = new Constructor()
        instance.#_id = object.id
        instance.#_type = object.type
        instance.#_origin = object.origin
        return instance
    }

    #_id: string = crypto.uuid()
    #_type: string = this.constructor.name
    #_origin: string = "Actant"

    get id() {
        return this.#_id
    }

    set id(value: string) {
        this.#_id = value
    }

    get type() {
        return this.#_type
    }

    get origin() {
        return this.#_origin
    }

    [Symbol.isActant](): boolean {
        return true
    }
}


export default Actant
