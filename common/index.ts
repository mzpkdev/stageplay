export * from "./utils"
export * from "./EventEmitter"
export * from "./KeyedSet"
export * from "./Logger"
export * from "./Scheduler"

export { default as EventEmitter } from "./EventEmitter"
export { default as KeyedSet } from "./KeyedSet"
export { default as Logger } from "./Logger"
export { default as Scheduler } from "./Scheduler"


import * as utils from "./utils"
import { default as EventEmitter } from "./EventEmitter"
import { default as KeyedSet } from "./KeyedSet"
import { default as Logger } from "./Logger"
import { default as Scheduler } from "./Scheduler"


const common = {
    utils,
    EventEmitter,
    KeyedSet,
    Logger,
    Scheduler
}


export default common