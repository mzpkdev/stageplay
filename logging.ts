import { tint, reset, magenta, Tint } from "logtint"
import { Logger, isObject } from "@/common"


const printObject = (object: Record<string, unknown>, short: boolean = false): Tint => {
    const text: Record<string, string> = {}
    const { id, type } = object
    text.type = type
        ? String(type)
        : object.constructor.name
    if (id && typeof id === "string") {
        text.id = `(${id.slice(0, 5)})`
    }
    const contents = Object.entries(object)
        .reduce<string[]>((accumulator, [ property, value ]) => {
            const prettyValue = isObject(value)
                ? printObject(value, true) : value
            accumulator.push(`${property}:${prettyValue}`)
            return accumulator
        }, [])
    text.contents = !short && contents.length > 0 ?
        ` { ${contents.join(", ")} }`
        : ''
    return tint`${text.type}${text.id}${text.contents}`
}

export const LogEvent = {
    Emit(event: string, emitted: any) {
        const text = {
            event: reset(event.padEnd(7, ' ')),
            emitted: tint`${magenta`${printObject(emitted)}`}`,
        }
        return (logger: Logger) =>
            logger.log(Logger.LogLevel.INFO, tint`Emitted ${text.event} with ${text.emitted}`)
    },
    Receive(event: string, received: any) {
        const text = {
            event: reset(event.padEnd(7, ' ')),
            received: tint`${magenta`${printObject(received)}`}`,
        }
        return (logger: Logger) =>
            logger.log(Logger.LogLevel.INFO, tint`Received ${text.event} with ${text.received}`)
    }
}
