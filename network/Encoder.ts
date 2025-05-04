import { encode, decode, ExtensionCodec } from "@msgpack/msgpack"


class Encoder {
    #_extension: ExtensionCodec = new ExtensionCodec()

    get extension() {
        return this.#_extension
    }

    encode(message: unknown): Uint8Array {
        return encode(message, { extensionCodec: this.#_extension })
    }

    decode(message: ArrayLike<number> | ArrayBufferView | ArrayBufferLike): unknown {
        return decode(message, { extensionCodec: this.#_extension })
    }
}


export default new Encoder()
