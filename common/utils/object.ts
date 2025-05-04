export const isObject = (object: unknown): object is Record<string, unknown> => {
    return typeof object === "object" && object !== null && !Array.isArray(object)
}

export const id = <TValue extends { id: string }>(value: TValue | unknown): string | unknown => {
    if (isObject(value) && "id" in value) {
        return value.id
    }
    return value
}

export default {
    isObject,
    id
}


// export const owns = <TObject extends unknown, TProperty extends string>(
//     object: TObject,
//     property: TProperty
// ): object is TObject & { [P in TProperty]: unknown } =>
//     Object.prototype.hasOwnProperty.call(object, property)
//
// export const merge = <TTarget extends object>(target: TTarget, source: object, depth: number = Infinity): TTarget => {
//     if (depth <= 0) {
//         return target
//     }
//     for (const property in source) {
//         if (!owns(source, property)) {
//             continue
//         }
//         const sourceValue = source[property]
//         const targetValue: unknown | undefined = target[property as never]
//         if (isObject(targetValue) && isObject(sourceValue)) {
//             (target as Record<string, unknown>)[property] = merge(targetValue, sourceValue, depth - 1)
//             continue
//         }
//         (target as Record<string, unknown>)[property] = sourceValue
//     }
//     return target
// }
