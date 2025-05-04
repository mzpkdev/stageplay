class KeyedSet<TIdentifiable> {
    static from<TIdentifiable>(key: (identifiable: TIdentifiable) => unknown, array: TIdentifiable[]): KeyedSet<TIdentifiable> {
        const registry = new KeyedSet<TIdentifiable>(key)
        for (const identifiable of array) {
            registry.add(identifiable)
        }
        return registry
    }

    #_key: (identifiable: TIdentifiable) => unknown
    #_dictionary: Map<unknown, TIdentifiable> = new Map()

    get size() {
        return this.#_dictionary.size
    }

    constructor(key: (identifiable: TIdentifiable) => unknown) {
        this.#_key = key
    }

    add(identifiable: TIdentifiable): this {
        this.#_dictionary.set(this.#_key(identifiable), identifiable)
        return this
    }

    delete(identifiable: TIdentifiable): this {
        this.#_dictionary.delete(this.#_key(identifiable))
        return this
    }

    get(id: string): TIdentifiable | undefined {
        return this.#_dictionary.get(id)
    }

    has(identifiable: TIdentifiable): boolean {
        return this.#_dictionary.has(this.#_key(identifiable))
    }

    * [Symbol.iterator]() {
        for (const value of this.#_dictionary.values()) {
            yield value
        }
    }
}


export default KeyedSet
