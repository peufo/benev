import type z from 'zod'

/** https://github.com/colinhacks/zod/issues/53#issuecomment-1386446580 */
export type ZodObj<T extends Record<PropertyKey, unknown>> = { [key in keyof T]: z.ZodType<T[key]> }
export const toTuple = Object.keys as <T extends {}>(o: T) => UnionToTuple<keyof T>

type UnionToIntersection<U> = (U extends unknown ? (arg: U) => 0 : never) extends (
	arg: infer I
) => 0
	? I
	: never

type LastInUnion<U> = UnionToIntersection<U extends unknown ? (x: U) => 0 : never> extends (
	x: infer L
) => 0
	? L
	: never
export type UnionToTuple<U, Last = LastInUnion<U>> = [U] extends [never]
	? []
	: [...UnionToTuple<Exclude<U, Last>>, Last]
