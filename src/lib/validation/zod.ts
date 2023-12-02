import zod from 'zod'
import { jsonParse } from '$lib/jsonParse'

export const z = {
	...zod,
	json,
	array,
	relations,
	dateOptional,
	booleanAsString,
	date: zod.coerce.date,
	number: zod.coerce.number,
	bigint: zod.coerce.bigint,
	boolean: zod.coerce.boolean,
}

function json<T extends zod.ZodRawShape>(shap: T) {
	return zod.string().transform(jsonParse).pipe(zod.object(shap))
}

function array<T extends zod.ZodTypeAny>(shap: T) {
	return zod.string().transform(jsonParse).pipe(zod.array(shap))
}

function booleanAsString() {
	return zod.enum(['true', 'false']).transform((value) => value === 'true')
}

function dateOptional() {
	return zod
		.string()
		.optional()
		.transform((v) => (v ? new Date(v) : v === '' ? null : undefined))
}

type Operation = 'set' | 'disconnect' | 'delete' | 'connect'
type OperationResult = Partial<Record<Operation, { id: string }[]>>
function relations(operation: Operation = 'set') {
	return zod
		.string()
		.transform(jsonParse)
		.pipe(zod.array(z.string()))
		.transform((ids) => ({ [operation]: ids.map((id) => ({ id })) } as OperationResult))
}

/** https://github.com/colinhacks/zod/issues/53#issuecomment-1386446580 */
export type ZodObj<T extends Record<PropertyKey, unknown>> = {
	[key in keyof T]: zod.ZodType<
		T[key],
		zod.ZodTypeDef,
		Date | boolean | number | string | undefined
	>
}
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
