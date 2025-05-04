const MAX_COMPONENTS = 1024
const WORD_SIZE = 32
const BITSET_SIZE = MAX_COMPONENTS / WORD_SIZE


export type Bitset = Uint32Array

export const create = (): Bitset => {
    return new Uint32Array()
}

export const set = (bitset: Uint32Array, index: number): void => {
    const bit = index % WORD_SIZE
    const word = Math.floor(index / WORD_SIZE)
    bitset[word] |= 1 << bit
}

export const has = (bitset: Uint32Array, mask: Uint32Array): boolean => {
    for (let i = 0; i < BITSET_SIZE; i++) {
        if ((bitset[i] & mask[i]) !== mask[i]) {
            return false
        }
    }
    return true
}

export const equals = (bitsetA: Bitset, bitsetB: Bitset): boolean => {
    for (let i = 0; i < BITSET_SIZE; i++) {
        if (bitsetA[i] !== bitsetB[i]) return false
    }
    return true
}


export default {
    create,
    set,
    has,
    equals
}
