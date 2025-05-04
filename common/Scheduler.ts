namespace Scheduler {
   export type Task =
       (task: Task) => void
}

class Scheduler {
    static POSTPONE_TICKS = 60

    #_tasks: Set<Scheduler.Task> = new Set()
    #_active: boolean = false
    #_delay: number
    #_timer: number | undefined

    get delay() {
        return this.#_delay
    }

    set delay(value: number) {
        this.#_delay = value
    }

    get active() {
        return this.#_active
    }

    constructor(delay: number) {
        this.#_delay = delay
    }

    schedule(task: Scheduler.Task): Scheduler.Task {
        this.#_tasks.add(task)
        return task
    }

    unschedule(task: Scheduler.Task): Scheduler.Task {
        this.#_tasks.delete(task)
        return task
    }

    start(): this {
        if (!this.#_active) {
            this.#_active = true
            this.#_loop()
        }
        return this
    }

    stop(): this {
        this.#_active = false
        clearTimeout(this.#_timer)
        return this
    }

    flush(): this {
        for (const task of this.#_tasks) {
            task(task)
        }
        clearTimeout(this.#_timer)
        this.#_loop()
        return this
    }

    readonly #_loop = (): void => {
        this.#_timer = setTimeout(() => {
            for (const task of this.#_tasks) {
                task(task)
            }
            if (this.#_active) {
                this.#_loop()
            }
        }, this.#_delay) as unknown as number
    }
}


export default Scheduler
