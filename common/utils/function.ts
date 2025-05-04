export const identity = <TValue>(value: TValue, ..._varargs: unknown[]) =>
    value

export const always = <TValue>(value: TValue) =>
    (..._varargs: unknown[]) => value


export default {
    identity,
    always
}
