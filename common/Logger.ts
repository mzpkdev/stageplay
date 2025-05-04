import { system } from "@/common"
import log, { Tinted, tint, red, yellow, blue, blackBright } from "logtint"


class Logger {
    static LOG_LEVEL: number = 0

    #_tag: string

    get timestamp() {
        const timestamp = new Date()
        if (system.inBrowser()) {
            const time = timestamp.toLocaleTimeString('en-US', { hour12: false })
            const milliseconds = String(timestamp.getMilliseconds()).padStart(3, '0')
            return `${time}.${milliseconds}`
        }
        return timestamp.toISOString()
    }

    constructor(tag: string) {
        this.#_tag = tag
    }

    use(template: (logger: Logger) => void): void {
        template(this)
    }

    log(level: number, message: string | Tinted): this {
        let logger: typeof console.log
        let accent
        switch (level) {
            case Logger.LogLevel.DEBUG:
                logger = console.debug
                accent = blackBright
                break
            case Logger.LogLevel.INFO:
                logger = console.info
                accent = blue
                break
            case Logger.LogLevel.WARN:
                logger = console.warn
                accent = yellow
                break
            case Logger.LogLevel.ERROR:
                logger = console.error
                accent = red
                break
            default:
                logger = console.log
                accent = (text: string) => text
        }
        const tag = this.#_tag
        const { timestamp} = this
        log(logger)`[${timestamp}] ${blackBright("[")}${accent(Logger.LogLevel[level])}${blackBright("]")} [${tag}] ${message}`
        return this
    }

    debug(message: string): this {
        this.log(Logger.LogLevel.DEBUG, message)
        return this
    }

    info(message: string): this {
        this.log(Logger.LogLevel.INFO, message)
        return this
    }

    warn(message: string): this {
        this.log(Logger.LogLevel.WARN, message)
        return this
    }

    error(message: string): this {
        this.log(Logger.LogLevel.DEBUG, message)
        return this
    }
}

namespace Logger {
    export enum LogLevel {
        DEBUG,
        INFO,
        WARN,
        ERROR
    }

    export const LOG_EVENT = (event: string, payload: Record<string, unknown>) => (logger: Logger) => {
        const pretty = (object: object): string => {
            const buffer: string[] = []
            for (const property in object) {
                if (!Object.prototype.hasOwnProperty.call(object, property)) {
                    continue
                }
                const value = object[property as keyof object]
                buffer.push(`${property}:${value}`)
            }
            return `{ ${buffer.join(", ")} }`
        }
        logger.log(LogLevel.INFO, tint`Fired ${event} with ${pretty(payload)}`)
    }
}


export default Logger