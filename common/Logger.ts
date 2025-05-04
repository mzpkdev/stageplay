import log, { Tint, tint, black, blue, yellow, red, cyan, dim, bright, magenta, reset, rgb, colorize } from "logtint"
import { system } from "@/common"


class Logger {
    static LOG_LEVEL: number = 0

    #_tag: string | Tint

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
        this.#_tag = colorize(tag).padEnd(14, " ")
        this.log(Logger.LogLevel.DEBUG, tint`Has been initialized`)
    }

    use(template: (logger: Logger) => void): void {
        template(this)
    }

    log(level: number, message: string | Tint): this {
        let logger: typeof console.log
        let accent
        switch (level) {
            case Logger.LogLevel.ERROR:
                logger = console.error
                accent = red
                break
            case Logger.LogLevel.WARN:
                logger = console.warn
                accent = yellow
                break
            case Logger.LogLevel.INFO:
                logger = console.info
                accent = blue
                break
            case Logger.LogLevel.DEBUG:
                logger = console.debug
                accent = bright(black)
                break
            default:
                logger = console.log
                accent = tint
        }
        const text = {
            timestamp: bright(black)`(${this.timestamp})`,
            level: accent`[${Logger.LogLevel[level]}]`.padEnd(7, " "),
            tag: this.#_tag,
            message: dim`${message}`
        }
        log(logger)`${text.timestamp} ${text.level} ${text.tag} ${text.message}`
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
}


export default Logger