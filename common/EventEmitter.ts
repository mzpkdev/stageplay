export type AnyEvent = Record<string, any>

export type Listener<TMessage = unknown> =
    (payload: TMessage) => void

class EventEmitter<TEventList extends AnyEvent = AnyEvent> {
    #_listeners = new Map<keyof TEventList, Set<Listener>>()

    on<TEvent extends keyof TEventList>(event: TEvent, listener: Listener<TEventList[TEvent]>): this {
        const existing = this.#_listeners.get(event) ?? new Set()
        existing.add(listener as Listener)
        this.#_listeners.set(event, existing)
        return this
    }

    off<TEvent extends keyof TEventList>(event: TEvent, listener: Listener<TEventList[TEvent]>): this {
        const existing = this.#_listeners.get(event)
        if (existing) {
            existing.delete(listener as Listener)
            if (existing.size === 0) {
                this.#_listeners.delete(event)
            }
        }
        return this
    }

    once<TEvent extends keyof TEventList>(event: TEvent, listener: Listener<TEventList[TEvent]>): this {
        const wrapper: Listener<TEventList[TEvent]> = (payload) => {
            this.off(event, wrapper)
            listener(payload)
        }
        return this.on(event, wrapper)
    }

    emit<TEvent extends keyof TEventList>(event: TEvent, payload: TEventList[TEvent]): this {
        const existing = this.#_listeners.get(event)
        if (existing) {
            for (const listener of existing) {
                listener(payload)
            }
        }
        return this
    }
}


export default EventEmitter
