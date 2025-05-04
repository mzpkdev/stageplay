export const uuid = (): string => {
    const getRandomValues = (typeof crypto !== 'undefined' && crypto.getRandomValues?.bind(crypto))
        || (typeof require !== 'undefined' && (() => {
            const { randomFillSync } = require('crypto');
            // @ts-ignore
            return (arr) => randomFillSync(Buffer.from(arr.buffer));
        })());

    if (!getRandomValues) {
        throw new Error('No secure random number generator available.');
    }

    const bytes = new Uint8Array(16);
    getRandomValues(bytes);

    // Set UUID version and variant bits
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10xxxxxx

    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0'));

    return (
        `${hex[0]}${hex[1]}${hex[2]}${hex[3]}-` +
        `${hex[4]}${hex[5]}-` +
        `${hex[6]}${hex[7]}-` +
        `${hex[8]}${hex[9]}-` +
        `${hex[10]}${hex[11]}${hex[12]}${hex[13]}${hex[14]}${hex[15]}`
    );
}

export const iid = () => {
    let next = 0
    const foo = (unique: string): number => {
        let id = foo.store.get(unique)
        if (!id) {
            foo.store.set(unique, next)
            id = next
        }
        next = next + 1
        return id
    }
    foo.store = new Map<string, number>
    return foo
}


export default {
    uuid,
    iid
}
