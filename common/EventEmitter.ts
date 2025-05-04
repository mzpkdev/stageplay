export type AnyEvent = Record<string, any>

export type Listener<TMessage = unknown> =
    (payload: TMessage) => void

class EventEmitter<TEventList extends AnyEvent = AnyEvent> {
    #_listeners = new Map<keyof TEventList, Set<Listener>>()

    on<TEvent extends keyof TEventList>(event: TEvent, listener: Listener<TEventList[TEvent]>): this {
        const eventCaseInsensitive = String(event).toLowerCase()
        const existing = this.#_listeners.get(eventCaseInsensitive) ?? new Set()
        existing.add(listener as Listener)
        this.#_listeners.set(eventCaseInsensitive, existing)
        return this
    }

    off<TEvent extends keyof TEventList>(event: TEvent, listener: Listener<TEventList[TEvent]>): this {
        const eventCaseInsensitive = String(event).toLowerCase()
        const existing = this.#_listeners.get(eventCaseInsensitive)
        if (existing) {
            existing.delete(listener as Listener)
            if (existing.size === 0) {
                this.#_listeners.delete(eventCaseInsensitive)
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
        const eventCaseInsensitive = String(event).toLowerCase()
        const existing = this.#_listeners.get(eventCaseInsensitive)
        if (existing) {
            for (const listener of existing) {
                listener(payload)
            }
        }
        return this
    }
}


export default EventEmitter
