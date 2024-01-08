import zod from 'zod'
import { jsonParse } from '$lib/jsonParse'

function json<T extends zod.ZodRawShape>(shap: T) {
	return zod.any().transform(jsonParse).pipe(zod.object(shap))
}

function array<T extends zod.ZodTypeAny>(shap: T) {
	return zod.any().transform(jsonParse).pipe(zod.array(shap))
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

type RelationsOperation = 'set' | 'disconnect' | 'delete' | 'connect'
type OperationResult = Partial<Record<RelationsOperation, { id: string }[]>>
function relationsUniqueInput(operation: RelationsOperation = 'set') {
	return zod
		.string()
		.transform(jsonParse)
		.pipe(zod.array(zod.string()))
		.transform((ids) => ({ [operation]: ids.map((id) => ({ id })) } as OperationResult))
}

const relation = {
	create<T extends zod.ZodRawShape>(shap: T) {
		return z.json({ create: zod.object(shap) })
	},
	connectOrCreate<T extends zod.ZodRawShape>(shap: T) {
		return z.json({ connectOrCreate: zod.object(shap) })
	},
	connect<T extends zod.ZodRawShape>(shap: T) {
		return z.json({ connect: zod.object(shap) })
	},
	upsert<T extends zod.ZodRawShape>(shap: T) {
		return z.json({ upsert: zod.object(shap) })
	},
	update<T extends zod.ZodRawShape>(shap: T) {
		return z.json({ update: zod.object(shap) })
	},
}

const relations = {
	set: relationsUniqueInput('set'),
	disconnect: relationsUniqueInput('set'),
	delete: relationsUniqueInput('delete'),
	connect: relationsUniqueInput('connect'),
	create<T extends zod.ZodRawShape>(shap: T) {
		return z.json({ create: zod.object(shap) })
	},
	connectOrCreate<T extends zod.ZodRawShape>(shap: T) {
		return z.json({ connectOrCreate: zod.object(shap) })
	},
	upsert<T extends zod.ZodRawShape>(shap: T) {
		return z.json({ upsert: zod.object(shap) })
	},
	createMany<T extends zod.ZodRawShape>(shap: T) {
		return z.json({ createMany: zod.object(shap) })
	},
	update<T extends zod.ZodRawShape>(shap: T) {
		return z.json({ update: zod.object(shap) })
	},
	updateMany<T extends zod.ZodRawShape>(shap: T) {
		return z.json({ updateMany: zod.object(shap) })
	},
	deleteMany<T extends zod.ZodRawShape>(shap: T) {
		return z.json({ deleteMany: zod.object(shap) })
	},
}

export const z = {
	...zod,
	json,
	array,
	relation,
	relations,
	dateOptional,
	booleanAsString,
	date: zod.coerce.date,
	number: zod.coerce.number,
	bigint: zod.coerce.bigint,
	boolean: zod.coerce.boolean,
}

/** https://github.com/colinhacks/zod/issues/53#issuecomment-1386446580 */
export type ZodObj<T = Record<PropertyKey, unknown>> = {
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
