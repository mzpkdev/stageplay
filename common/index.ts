export * from "./utils"
export * from "./EventEmitter"
export * from "./KeyedSet"
export * from "./Scheduler"

export { default as EventEmitter } from "./EventEmitter"
export { default as KeyedSet } from "./KeyedSet"
export { default as Scheduler } from "./Scheduler"


import * as utils from "./utils"
import { default as EventEmitter } from "./EventEmitter"
import { default as KeyedSet } from "./KeyedSet"
import { default as Scheduler } from "./Scheduler"


const common = {
    utils,
    EventEmitter,
    KeyedSet,
    Scheduler
}


export default common