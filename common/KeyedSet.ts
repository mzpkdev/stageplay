class KeyedSet<TKeyed, TKey = unknown> {
    static from<TKeyed, TKey>(key: (keyed: TKeyed) => TKey, collection: Iterable<TKeyed>): KeyedSet<TKeyed, TKey> {
        const registry = new KeyedSet<TKeyed, TKey>(key)
        for (const keyed of collection) {
            registry.add(keyed)
        }
        return registry
    }

    #_key: (keyed: TKeyed) => TKey
    #_dictionary: Map<TKey, TKeyed> = new Map()

    get size() {
        return this.#_dictionary.size
    }

    constructor(key: (identifiable: TKeyed) => TKey) {
        this.#_key = key
    }

    add(keyed: TKeyed): this {
        this.#_dictionary.set(this.#_key(keyed), keyed)
        return this
    }

    delete(keyed: TKeyed): this {
        this.#_dictionary.delete(this.#_key(keyed))
        return this
    }

    get(id: TKey): TKeyed | undefined {
        return this.#_dictionary.get(id)
    }

    has(keyed: TKeyed): boolean {
        return this.#_dictionary.has(this.#_key(keyed))
    }

    at(index: number): TKeyed | undefined {
        let i = 0
        index = index < 0
            ? this.#_dictionary.size + index : index
        for (const keyed of this.#_dictionary.values()) {
            if (i === index) {
                return keyed
            }
            i++
        }
        return undefined
    }

    * [Symbol.iterator]() {
        for (const value of this.#_dictionary.values()) {
            yield value
        }
    }
}


export default KeyedSet
