import zod from 'zod'
import { jsonParse } from 'fuma'

// `transform` passe `(value, ctx)` au callback: appeler `jsonParse` directement lui
// ferait recevoir le contexte de raffinement comme valeur de repli. On explicite `null`,
// qui échoue ensuite dans le `pipe` comme le faisait le contexte en zod 3.
function json<T extends zod.ZodRawShape>(shap: T) {
	return zod.union([
		zod.object(shap),
		zod
			.string()
			.transform((value) => jsonParse<unknown>(value, null))
			.pipe(zod.object(shap)),
	])
}

function jsonArray<T extends zod.ZodType>(shap: T) {
	return zod.union([
		zod.array(shap),
		zod
			.string()
			.transform((value) => jsonParse<unknown>(value, null))
			.pipe(zod.array(shap)),
	])
}

const relation = {
	connect: zod.object({ id: zod.string() }).transform((item) => ({ connect: item })),
	create<T extends zod.ZodRawShape>(shap: T) {
		return zod.object(shap).transform((value) => ({ create: value }))
	},
	connectOrCreate<T extends zod.ZodRawShape>(shap: T) {
		return zod.object(shap).transform((value) => ({ connectOrCreate: value }))
	},
	upsert<T extends zod.ZodRawShape>(shap: T) {
		return zod.object(shap).transform((value) => ({ upsert: value }))
	},
	update<T extends zod.ZodRawShape>(shap: T) {
		return zod.object(shap).transform((value) => ({ update: value }))
	},
}

type RelationsOperation = 'set' | 'disconnect' | 'delete' | 'connect'
type OperationResult = Partial<Record<RelationsOperation, { id: string }[]>>
function relationsUniqueInput(operation: RelationsOperation = 'set') {
	return zod
		.array(zod.object({ id: zod.string() }))
		.transform((items) => ({ [operation]: items.map(({ id }) => ({ id })) }) as OperationResult)
}

function objectOrArray<T extends zod.ZodRawShape>(shap: T) {
	return zod.union([zod.array(zod.object(shap)), zod.object(shap)])
}

const relations = {
	set: relationsUniqueInput('set'),
	disconnect: relationsUniqueInput('set'),
	delete: relationsUniqueInput('delete'),
	connect: relationsUniqueInput('connect'),
	create<T extends zod.ZodRawShape>(shap: T) {
		return objectOrArray(shap).transform((value) => ({ create: value }))
	},
	connectOrCreate<T extends zod.ZodRawShape>(shap: T) {
		return objectOrArray(shap).transform((value) => ({ connectOrCreate: value }))
	},
	upsert<T extends zod.ZodRawShape>(shap: T) {
		return objectOrArray(shap).transform((value) => ({ upsert: value }))
	},
	createMany<T extends zod.ZodRawShape>(shap: T) {
		return objectOrArray(shap).transform((value) => ({ createMany: value }))
	},
	update<T extends zod.ZodRawShape>(shap: T) {
		return objectOrArray(shap).transform((value) => ({ update: value }))
	},
	updateMany<T extends zod.ZodRawShape>(shap: T) {
		return objectOrArray(shap).transform((value) => ({ updateMany: value }))
	},
	deleteMany<T extends zod.ZodRawShape>(shap: T) {
		return objectOrArray(shap).transform((value) => ({ deleteMany: value }))
	},
}

const filter = {
	number: json({
		min: zod.number().optional(),
		max: zod.number().optional(),
		order: zod.enum(['asc', 'desc']).optional(),
	}).optional(),
	multiselect: jsonArray(zod.string()).optional(),
	range: json({
		start: zod.coerce.date().optional(),
		end: zod.coerce.date().optional(),
		order: zod.enum(['asc', 'desc']).optional(),
	}).optional(),
	boolean: zod
		.enum(['true', 'false'])
		.transform((value) => value === 'true')
		.optional(),
}

export const z = {
	...zod,
	json,
	jsonArray,
	relation,
	relations,
	filter,
}

export type ZodInfer<T extends zod.ZodType> = zod.infer<T>

// zod 4 ne fournit plus `SuperRefinement`: c'est désormais la signature attendue
// par `.superRefine()`, qu'on redéclare à l'identique.
export type SuperRefinement<T> = (value: T, ctx: zod.RefinementCtx<T>) => void | Promise<void>

/**
 * @example type MyModel = {name: z.string()} satisfies ZodObj<{name: string}>
 */
export type ZodObj<T = Record<PropertyKey, unknown>> = {
	// zod 4: `ZodType<Output, Input>` — le paramètre `ZodTypeDef` du milieu a disparu.
	[key in keyof T]: zod.ZodType<
		T[key],
		Date | boolean | number | string | undefined | null | object
	>
}
export const toTuple = Object.keys as <T extends {}>(o: T) => UnionToTuple<keyof T>

type UnionToIntersection<U> = (U extends unknown ? (arg: U) => 0 : never) extends (
	arg: infer I
) => 0
	? I
	: never

type LastInUnion<U> =
	UnionToIntersection<U extends unknown ? (x: U) => 0 : never> extends (x: infer L) => 0 ? L : never
export type UnionToTuple<U, Last = LastInUnion<U>> = [U] extends [never]
	? []
	: [...UnionToTuple<Exclude<U, Last>>, Last]
