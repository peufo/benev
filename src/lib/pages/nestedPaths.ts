// thanks https://javascript.plainenglish.io/advanced-typescript-type-level-nested-object-paths-7f3d8901f29a

type GenericObject = Record<PropertyKey, unknown>

type Join<L extends PropertyKey | undefined, R extends PropertyKey | undefined> = L extends
	| string
	| number
	? R extends string | number
		? `${L}.${R}`
		: L
	: R extends string | number
	? R
	: undefined

type Union<L extends unknown | undefined, R extends unknown | undefined> = L extends undefined
	? R extends undefined
		? undefined
		: R
	: R extends undefined
	? L
	: L | R

/**
 * NestedPaths
 * Get all the possible paths of an object
 * @example
 * type Keys = NestedPaths<{ a: { b: { c: string } }>
 * // 'a' | 'a.b' | 'a.b.c'
 */
export type NestedPaths<
	T extends GenericObject,
	Prev extends PropertyKey | undefined = undefined,
	Path extends PropertyKey | undefined = undefined
> = {
	[K in keyof T]: Required<T>[K] extends GenericObject
		? NestedPaths<Required<T>[K], Union<Prev, Path>, Join<Path, K>>
		: Union<Union<Prev, Path>, Join<Path, K>>
}[keyof T]
