export const inBrowser = (): boolean => {
    return typeof typeof window !== "undefined" && typeof process === "undefined"
}

export const inServer = (): boolean => {
    return !inBrowser()
}

export const requestSystemTick = (fn: (...varargs: unknown[]) => unknown): number => {
    if (inBrowser()) {
        return requestAnimationFrame(fn)
    } else {
        const SINGLE_FRAME_DELAY_IN_FPS_60 = 16.67
        return setTimeout(fn, SINGLE_FRAME_DELAY_IN_FPS_60) as unknown as number
    }
}

export const cancelSystemTick = (id: number | undefined): void => {
    if (id === undefined) {
        return void 0
    }
    if (inBrowser()) {
        cancelAnimationFrame(id)
    } else {
        clearTimeout(id)
    }
}


export default {
    inBrowser,
    inServer,
    requestSystemTick,
    cancelSystemTick
}
